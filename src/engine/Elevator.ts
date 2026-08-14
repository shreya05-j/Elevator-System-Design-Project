import { Direction, ElevatorState } from "./types";
import { Request } from "./Request";

/**
 * Models a single elevator car with its complete state.
 *
 * Manages:
 *  - Current floor position
 *  - Direction of travel
 *  - Operational state
 *  - Internal queue of assigned requests
 *  - Statistics (total stops, distance traveled, energy usage)
 */
export class Elevator {
  public readonly id: number;
  public readonly name: string;
  public currentFloor: number;
  public direction: Direction;
  public state: ElevatorState;
  public requests: Request[];
  public readonly minFloor: number;
  public readonly maxFloor: number;

  // --- Statistics ---
  public totalStops: number = 0;
  public totalDistance: number = 0;
  public motorStarts: number = 0;
  public idleSteps: number = 0;

  // --- Passengers on board ---
  public passengers: Request[] = [];

  constructor(
    id: number,
    startFloor: number = 0,
    minFloor: number = 0,
    maxFloor: number = 9
  ) {
    this.id = id;
    this.name = `E${id}`;
    this.currentFloor = startFloor;
    this.direction = Direction.IDLE;
    this.state = ElevatorState.STOPPED;
    this.requests = [];
    this.minFloor = minFloor;
    this.maxFloor = maxFloor;
  }

  /** Check if this elevator has any pending work. */
  get isIdle(): boolean {
    return (
      this.requests.length === 0 &&
      this.passengers.length === 0 &&
      this.direction === Direction.IDLE
    );
  }

  /** All floors this elevator needs to visit (pick-up + drop-off). */
  get targetFloors(): number[] {
    const pickups = this.requests
      .filter((r) => !r.pickedUp)
      .map((r) => r.currentFloor);
    const dropoffs = this.passengers.map((r) => r.targetFloor);
    return [...new Set([...pickups, ...dropoffs])];
  }

  /**
   * Assign a new request to this elevator's queue.
   */
  assignRequest(request: Request): void {
    this.requests.push(request);
  }

  /**
   * Move the elevator one floor in its current direction.
   * Returns a log entry describing what happened.
   */
  step(): string[] {
    const logs: string[] = [];

    if (this.state === ElevatorState.MAINTENANCE) {
      logs.push(`${this.name}: 🔧 In maintenance`);
      return logs;
    }

    // --- Pick up passengers at current floor ---
    const pickups = this.requests.filter(
      (r) => !r.pickedUp && r.currentFloor === this.currentFloor
    );
    for (const req of pickups) {
      req.pickedUp = true;
      this.passengers.push(req);
      logs.push(
        `${this.name}: 🚶 Picked up passenger at F${this.currentFloor} → F${req.targetFloor}`
      );
      this.totalStops++;
    }

    // --- Drop off passengers at current floor ---
    const dropoffs = this.passengers.filter(
      (r) => r.targetFloor === this.currentFloor
    );
    for (const req of dropoffs) {
      req.serviced = true;
      logs.push(
        `${this.name}: ✅ Dropped off passenger at F${this.currentFloor}`
      );
      this.totalStops++;
    }
    this.passengers = this.passengers.filter(
      (r) => r.targetFloor !== this.currentFloor
    );
    // Clean serviced requests
    this.requests = this.requests.filter((r) => !r.serviced);

    // --- Determine next move ---
    if (this.requests.length === 0 && this.passengers.length === 0) {
      if (this.direction !== Direction.IDLE) {
        logs.push(`${this.name}: 💤 Now idle at F${this.currentFloor}`);
      }
      this.direction = Direction.IDLE;
      this.state = ElevatorState.STOPPED;
      this.idleSteps++;
      return logs;
    }

    // Move one floor
    const prevDirection = this.direction;
    if (this.direction === Direction.UP) {
      this.currentFloor = Math.min(this.currentFloor + 1, this.maxFloor);
      this.totalDistance++;
    } else if (this.direction === Direction.DOWN) {
      this.currentFloor = Math.max(this.currentFloor - 1, this.minFloor);
      this.totalDistance++;
    }

    this.state = ElevatorState.MOVING;

    if (
      this.direction !== Direction.IDLE &&
      prevDirection === Direction.IDLE
    ) {
      this.motorStarts++;
    }

    logs.push(
      `${this.name}: ${this.direction === Direction.UP ? "⬆️" : this.direction === Direction.DOWN ? "⬇️" : "⏸️"} Moved to F${this.currentFloor}`
    );

    return logs;
  }

  /** Snapshot of the elevator state for rendering. */
  snapshot(): ElevatorSnapshot {
    return {
      id: this.id,
      name: this.name,
      currentFloor: this.currentFloor,
      direction: this.direction,
      state: this.state,
      queueSize: this.requests.length,
      passengerCount: this.passengers.length,
      targetFloors: this.targetFloors,
      totalStops: this.totalStops,
      totalDistance: this.totalDistance,
      motorStarts: this.motorStarts,
      idleSteps: this.idleSteps,
    };
  }
}

export interface ElevatorSnapshot {
  id: number;
  name: string;
  currentFloor: number;
  direction: Direction;
  state: ElevatorState;
  queueSize: number;
  passengerCount: number;
  targetFloors: number[];
  totalStops: number;
  totalDistance: number;
  motorStarts: number;
  idleSteps: number;
}
