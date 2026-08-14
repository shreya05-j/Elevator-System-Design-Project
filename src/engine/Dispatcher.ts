import { Elevator, ElevatorSnapshot } from "./Elevator";
import { Request } from "./Request";
import { RoutingStrategy, ScanRoutingStrategy, SustainableRoutingStrategy } from "./RoutingStrategy";
import { StrategyType } from "./types";

/**
 * Central Dispatcher — Orchestrates the entire elevator system.
 *
 * Responsibilities:
 *  1. Maintains the pool of Elevator instances
 *  2. Receives incoming passenger Requests
 *  3. Delegates assignment to the active RoutingStrategy
 *  4. Advances the simulation by one discrete time step
 *  5. Produces a complete system snapshot for the UI layer
 */
export class Dispatcher {
  public elevators: Elevator[];
  public strategy: RoutingStrategy;
  public strategyType: StrategyType;
  public stepCount: number = 0;
  public logs: string[] = [];
  public allRequests: Request[] = [];

  private readonly maxFloor: number;
  private readonly minFloor: number;

  constructor(
    numElevators: number,
    minFloor: number = 0,
    maxFloor: number = 9,
    strategyType: StrategyType = StrategyType.SCAN
  ) {
    this.minFloor = minFloor;
    this.maxFloor = maxFloor;
    this.strategyType = strategyType;

    // Initialize elevators at ground floor
    this.elevators = [];
    for (let i = 0; i < numElevators; i++) {
      this.elevators.push(new Elevator(i + 1, 0, minFloor, maxFloor));
    }

    // Initialize with default strategy
    this.strategy = this.createStrategy(strategyType);
  }

  /** Factory method for strategy creation. */
  private createStrategy(type: StrategyType): RoutingStrategy {
    switch (type) {
      case StrategyType.SCAN:
        return new ScanRoutingStrategy();
      case StrategyType.SUSTAINABLE:
        return new SustainableRoutingStrategy();
    }
  }

  /** Hot-swap the routing strategy at runtime. */
  switchStrategy(type: StrategyType): void {
    this.strategyType = type;
    this.strategy = this.createStrategy(type);
    this.logs.push(`🔄 Strategy switched to: ${this.strategy.name}`);
  }

  /**
   * Submit a new passenger request.
   * The strategy decides which elevator receives it.
   */
  addRequest(currentFloor: number, targetFloor: number): Request {
    const request = new Request(currentFloor, targetFloor);
    this.allRequests.push(request);

    const elevatorIdx = this.strategy.assignRequest(
      request,
      this.elevators
    );
    const elevator = this.elevators[elevatorIdx];
    elevator.assignRequest(request);

    this.logs.push(
      `📥 ${request.toString()} → assigned to ${elevator.name}`
    );

    return request;
  }

  /**
   * Advance the simulation by one discrete time step.
   *
   * Each step:
   *  1. Compute direction for each elevator (via strategy)
   *  2. Execute one move per elevator
   *  3. Collect logs
   */
  step(): StepResult {
    this.stepCount++;
    const stepLogs: string[] = [`━━━ Step ${this.stepCount} ━━━`];

    for (const elevator of this.elevators) {
      // Strategy decides direction before each move
      this.strategy.computeDirection(elevator);

      // Elevator executes one step
      const moveLogs = elevator.step();
      stepLogs.push(...moveLogs);
    }

    this.logs.push(...stepLogs);

    return {
      step: this.stepCount,
      logs: stepLogs,
      snapshots: this.elevators.map((e) => e.snapshot()),
      isComplete: this.isComplete(),
    };
  }

  /** Check if all requests have been serviced. */
  isComplete(): boolean {
    return this.elevators.every((e) => e.isIdle);
  }

  /** Reset the entire system to initial state. */
  reset(): void {
    this.stepCount = 0;
    this.logs = [];
    this.allRequests = [];
    const numElevators = this.elevators.length;
    this.elevators = [];
    for (let i = 0; i < numElevators; i++) {
      this.elevators.push(
        new Elevator(i + 1, 0, this.minFloor, this.maxFloor)
      );
    }
  }

  /** Full system snapshot for rendering. */
  snapshot(): SystemSnapshot {
    return {
      stepCount: this.stepCount,
      strategyName: this.strategy.name,
      strategyDescription: this.strategy.description,
      elevators: this.elevators.map((e) => e.snapshot()),
      isComplete: this.isComplete(),
      totalRequests: this.allRequests.length,
      servicedRequests: this.allRequests.filter((r) => r.serviced).length,
      pendingRequests: this.allRequests.filter(
        (r) => !r.serviced && !r.pickedUp
      ).length,
      inTransit: this.allRequests.filter(
        (r) => r.pickedUp && !r.serviced
      ).length,
    };
  }
}

export interface StepResult {
  step: number;
  logs: string[];
  snapshots: ElevatorSnapshot[];
  isComplete: boolean;
}

export interface SystemSnapshot {
  stepCount: number;
  strategyName: string;
  strategyDescription: string;
  elevators: ElevatorSnapshot[];
  isComplete: boolean;
  totalRequests: number;
  servicedRequests: number;
  pendingRequests: number;
  inTransit: number;
}
