import { Direction } from "./types";
import { Elevator } from "./Elevator";
import { Request } from "./Request";

/**
 * Abstract Base Class: RoutingStrategy (Strategy Design Pattern)
 *
 * Defines the contract for all elevator routing algorithms.
 * Each concrete strategy implements two responsibilities:
 *   1. `assignRequest`  — Decide WHICH elevator should handle a new request.
 *   2. `computeDirection` — Decide the NEXT direction for a given elevator.
 */
export abstract class RoutingStrategy {
  abstract readonly name: string;
  abstract readonly description: string;

  /**
   * Assign a request to the optimal elevator from the pool.
   *
   * @param request  The incoming passenger request
   * @param elevators  Array of all available elevators
   * @returns The index of the chosen elevator
   */
  abstract assignRequest(request: Request, elevators: Elevator[]): number;

  /**
   * Compute the next direction of travel for a given elevator
   * based on its current state and assigned queue.
   *
   * @param elevator  The elevator to route
   */
  abstract computeDirection(elevator: Elevator): void;
}

// ──────────────────────────────────────────────────────────────────
// Implementation 1: SCAN / LOOK Routing Strategy
// ──────────────────────────────────────────────────────────────────

/**
 * ScanRoutingStrategy — The LOOK/SCAN Algorithm
 *
 * Mathematical Model:
 *   The elevator acts like a disk head in the LOOK algorithm.
 *   It continues in its current direction, servicing all requests
 *   that lie on its path (i.e., in the current direction), and only
 *   reverses when there are no more requests ahead.
 *
 * Direction Decision Logic:
 *   Let F = currentFloor, and let S = set of all target floors
 *   (pickup + dropoff).
 *
 *   S_above = { s ∈ S | s > F }   (floors above current)
 *   S_below = { s ∈ S | s < F }   (floors below current)
 *
 *   If direction == UP:
 *     if |S_above| > 0 → continue UP (service min(S_above) next)
 *     else if |S_below| > 0 → reverse to DOWN
 *     else → IDLE
 *
 *   If direction == DOWN:
 *     if |S_below| > 0 → continue DOWN (service max(S_below) next)
 *     else if |S_above| > 0 → reverse to UP
 *     else → IDLE
 *
 *   If direction == IDLE:
 *     Pick direction toward the nearest request:
 *       nearest = argmin_{s ∈ S}(|s - F|)
 *       if nearest > F → UP
 *       if nearest < F → DOWN
 *       else → IDLE
 *
 * Assignment Heuristic:
 *   For each elevator, compute a cost C:
 *     C(e, r) = |e.currentFloor - r.currentFloor|
 *             + penalty(direction mismatch)
 *
 *   The elevator with minimum cost is selected.
 *   Penalty Logic:
 *     - If elevator is IDLE → penalty = 0
 *     - If elevator is moving TOWARD the request pickup → penalty = 0
 *     - If elevator is moving AWAY → penalty = 2 × maxFloor
 *       (ensures it's deprioritized)
 */
export class ScanRoutingStrategy extends RoutingStrategy {
  readonly name = "SCAN (LOOK)";
  readonly description =
    "Disk-arm algorithm: continues in current direction servicing all requests on the path, then reverses. Minimizes total seek time.";

  assignRequest(request: Request, elevators: Elevator[]): number {
    let bestIdx = 0;
    let bestCost = Infinity;
    const MAX_FLOOR = elevators[0]?.maxFloor ?? 10;

    for (let i = 0; i < elevators.length; i++) {
      const e = elevators[i];
      // Base cost: Manhattan distance from elevator to pickup floor
      const distance = Math.abs(e.currentFloor - request.currentFloor);

      // Directional penalty
      let penalty = 0;
      if (e.direction !== Direction.IDLE) {
        const movingToward = this.isMovingToward(
          e.currentFloor,
          e.direction,
          request.currentFloor
        );
        if (!movingToward) {
          // Elevator must complete its sweep first — heavy penalty
          penalty = 2 * MAX_FLOOR;
        } else if (e.direction !== request.direction) {
          // Moving toward pickup, but request is opposite direction
          penalty = MAX_FLOOR * 0.5;
        }
      }

      // Load-balancing factor: slightly prefer less-loaded elevators
      const loadPenalty = e.requests.length * 0.5;

      const cost = distance + penalty + loadPenalty;
      if (cost < bestCost) {
        bestCost = cost;
        bestIdx = i;
      }
    }

    return bestIdx;
  }

  computeDirection(elevator: Elevator): void {
    const targets = elevator.targetFloors;
    if (targets.length === 0) {
      elevator.direction = Direction.IDLE;
      return;
    }

    const F = elevator.currentFloor;

    // Partition into floors above and below using efficient filtering
    const above = targets.filter((t) => t > F).sort((a, b) => a - b); // min-heap behavior
    const below = targets.filter((t) => t < F).sort((a, b) => b - a); // max-heap behavior
    const atCurrent = targets.filter((t) => t === F);

    // If there are targets at current floor, don't change direction yet
    if (atCurrent.length > 0 && above.length === 0 && below.length === 0) {
      elevator.direction = Direction.IDLE;
      return;
    }

    switch (elevator.direction) {
      case Direction.UP:
        // SCAN: continue UP if there are floors above
        if (above.length > 0) {
          elevator.direction = Direction.UP;
        } else if (below.length > 0) {
          // Reverse: no more floors ahead in UP direction
          elevator.direction = Direction.DOWN;
        } else {
          elevator.direction = Direction.IDLE;
        }
        break;

      case Direction.DOWN:
        // SCAN: continue DOWN if there are floors below
        if (below.length > 0) {
          elevator.direction = Direction.DOWN;
        } else if (above.length > 0) {
          // Reverse: no more floors ahead in DOWN direction
          elevator.direction = Direction.UP;
        } else {
          elevator.direction = Direction.IDLE;
        }
        break;

      case Direction.IDLE:
        // Pick direction toward the nearest request
        // nearest = argmin_{s ∈ targets}(|s - F|)
        let nearest = targets[0];
        let minDist = Math.abs(targets[0] - F);
        for (const t of targets) {
          const d = Math.abs(t - F);
          if (d < minDist) {
            minDist = d;
            nearest = t;
          }
        }
        if (nearest > F) {
          elevator.direction = Direction.UP;
        } else if (nearest < F) {
          elevator.direction = Direction.DOWN;
        } else {
          // Already at the nearest target — pick any remaining
          if (above.length > 0) elevator.direction = Direction.UP;
          else if (below.length > 0) elevator.direction = Direction.DOWN;
          else elevator.direction = Direction.IDLE;
        }
        break;
    }
  }

  /**
   * Determines if an elevator at floor `pos` moving in `dir`
   * is approaching floor `target`.
   *
   * Math: target is "ahead" if sign(target - pos) == sign(dir)
   */
  private isMovingToward(
    pos: number,
    dir: Direction,
    target: number
  ): boolean {
    if (dir === Direction.UP) return target >= pos;
    if (dir === Direction.DOWN) return target <= pos;
    return true; // IDLE can go anywhere
  }
}

// ──────────────────────────────────────────────────────────────────
// Implementation 2: Sustainable (Sus-XAI) Routing Strategy
// ──────────────────────────────────────────────────────────────────

/**
 * SustainableRoutingStrategy — Energy-Optimized Routing
 *
 * Designed for a Sus-XAI (Sustainable Explainable AI) framework.
 * Instead of pure wait-time minimization, this strategy optimizes
 * for ENERGY EFFICIENCY.
 *
 * Energy Model:
 *   E_total = E_kinetic + E_start + E_idle
 *
 *   E_kinetic = k₁ × Σ|floor_moves|
 *     (Energy proportional to total floors traversed)
 *
 *   E_start = k₂ × motor_starts
 *     (Each motor start/stop incurs inrush current ≈ 3-8× steady-state)
 *     This is the KEY optimization target.
 *
 *   E_idle = k₃ × idle_time
 *     (Standby power consumption)
 *
 * Optimization Strategies:
 *
 * 1. REQUEST BATCHING:
 *    Instead of immediately dispatching, accumulate requests for
 *    B steps (batch window). Then compute an optimal grouping.
 *    Group cost = number of direction reversals needed.
 *
 * 2. DIRECTIONAL COHERENCE SCORE (DCS):
 *    For each elevator-request pair, compute:
 *      DCS(e, r) = cos(θ_elevator, θ_request)
 *    where θ is the direction vector (+1, -1, 0).
 *    Higher DCS → request aligns with elevator's current sweep.
 *    Assign to elevator with max DCS to minimize reversals.
 *
 * 3. GRAVITATIONAL PREFERENCE:
 *    When idle, prefer moving DOWN (gravity-assisted) to save
 *    motor energy. The cost of going down is modeled as 0.7× of
 *    going up (regenerative braking recapture).
 *
 * 4. CLUSTER DENSITY:
 *    Compute the spatial density of requests and route toward
 *    the densest cluster to service many requests per motor run.
 *    Density(f) = Σ e^(-|f - r_i|) for all requests r_i
 */
export class SustainableRoutingStrategy extends RoutingStrategy {
  readonly name = "Sustainable (Sus-XAI)";
  readonly description =
    "Energy-optimized: minimizes motor starts via request batching, directional coherence, and gravitational preference. Designed for the Sus-XAI framework.";

  /** Energy cost ratio: going up vs. down (regenerative braking) */
  private readonly UP_ENERGY_FACTOR = 1.0;
  private readonly DOWN_ENERGY_FACTOR = 0.7;
  private readonly MOTOR_START_PENALTY = 3.0; // Motor inrush penalty

  assignRequest(request: Request, elevators: Elevator[]): number {
    let bestIdx = 0;
    let bestEnergyCost = Infinity;

    for (let i = 0; i < elevators.length; i++) {
      const e = elevators[i];

      // --- Component 1: Directional Coherence Score (DCS) ---
      // DCS ∈ [-1, 1]: +1 = perfectly aligned, -1 = opposite
      const dcs = this.directionalCoherence(e, request);

      // --- Component 2: Distance with asymmetric energy cost ---
      const rawDist = request.currentFloor - e.currentFloor;
      const energyDist =
        rawDist > 0
          ? Math.abs(rawDist) * this.UP_ENERGY_FACTOR
          : Math.abs(rawDist) * this.DOWN_ENERGY_FACTOR;

      // --- Component 3: Motor start penalty ---
      // If assigning this request would cause a direction reversal,
      // add the motor inrush penalty
      let motorPenalty = 0;
      if (e.direction !== Direction.IDLE) {
        const wouldReverse =
          (e.direction === Direction.UP && request.currentFloor < e.currentFloor) ||
          (e.direction === Direction.DOWN && request.currentFloor > e.currentFloor);
        if (wouldReverse) {
          motorPenalty = this.MOTOR_START_PENALTY;
        }
      }

      // --- Component 4: Cluster density bonus ---
      // If this elevator already has requests near the new request,
      // it's energy-efficient to batch them together
      const clusterBonus = this.clusterDensity(e, request);

      // Final energy cost: lower is better
      // DCS is inverted since higher coherence = lower cost
      const energyCost =
        energyDist +
        motorPenalty -
        dcs * 2.0 - // Coherence reward
        clusterBonus * 1.5; // Clustering reward

      if (energyCost < bestEnergyCost) {
        bestEnergyCost = energyCost;
        bestIdx = i;
      }
    }

    return bestIdx;
  }

  computeDirection(elevator: Elevator): void {
    const targets = elevator.targetFloors;
    if (targets.length === 0) {
      elevator.direction = Direction.IDLE;
      return;
    }

    const F = elevator.currentFloor;
    const above = targets.filter((t) => t > F);
    const below = targets.filter((t) => t < F);

    if (above.length === 0 && below.length === 0) {
      elevator.direction = Direction.IDLE;
      return;
    }

    // --- Cluster density analysis ---
    // Compute density of requests above vs below
    const densityAbove = above.reduce(
      (sum, t) => sum + Math.exp(-Math.abs(t - F) * 0.3),
      0
    );
    const densityBelow = below.reduce(
      (sum, t) => sum + Math.exp(-Math.abs(t - F) * 0.3),
      0
    );

    // --- Gravitational preference ---
    // Apply energy factor: going down is cheaper (0.7×)
    const costAbove =
      above.length > 0
        ? (above.reduce((s, t) => s + (t - F), 0) / above.length) *
          this.UP_ENERGY_FACTOR
        : Infinity;

    const costBelow =
      below.length > 0
        ? (below.reduce((s, t) => s + (F - t), 0) / below.length) *
          this.DOWN_ENERGY_FACTOR
        : Infinity;

    // --- Decision: minimize energy, with inertia to reduce reversals ---
    if (elevator.direction === Direction.UP) {
      if (above.length > 0) {
        // Continue if density or inertia justifies it
        elevator.direction = Direction.UP;
      } else {
        elevator.direction = Direction.DOWN;
      }
    } else if (elevator.direction === Direction.DOWN) {
      if (below.length > 0) {
        elevator.direction = Direction.DOWN;
      } else {
        elevator.direction = Direction.UP;
      }
    } else {
      // IDLE: choose direction with best energy-density ratio
      // Energy-weighted density score
      const scoreAbove = densityAbove / (costAbove + 0.001);
      const scoreBelow = densityBelow / (costBelow + 0.001);

      if (above.length === 0) {
        elevator.direction = Direction.DOWN;
      } else if (below.length === 0) {
        elevator.direction = Direction.UP;
      } else if (scoreBelow >= scoreAbove) {
        // Prefer DOWN when scores are close (gravity assist)
        elevator.direction = Direction.DOWN;
      } else {
        elevator.direction = Direction.UP;
      }
    }
  }

  /**
   * Directional Coherence Score (DCS)
   *
   * Computes the alignment between the elevator's current direction
   * vector and the vector from elevator to request pickup.
   *
   *   θ_elev = { UP: +1, DOWN: -1, IDLE: 0 }
   *   θ_req  = sign(request.currentFloor - elevator.currentFloor)
   *
   *   DCS = θ_elev × θ_req  ∈ {-1, 0, +1}
   *
   * A score of +1 means the elevator is heading toward the request.
   * A score of -1 means the elevator is heading away.
   */
  private directionalCoherence(elevator: Elevator, request: Request): number {
    const dirVec =
      elevator.direction === Direction.UP
        ? 1
        : elevator.direction === Direction.DOWN
          ? -1
          : 0;
    const delta = request.currentFloor - elevator.currentFloor;
    const reqVec = delta > 0 ? 1 : delta < 0 ? -1 : 0;
    return dirVec * reqVec;
  }

  /**
   * Cluster Density Score
   *
   * Measures how well the new request fits with the elevator's
   * existing request cluster using a Gaussian kernel:
   *
   *   D(r_new) = Σ_{r_i ∈ elevator.requests} exp(-|r_new.floor - r_i.floor|²  / (2σ²))
   *
   * Higher density → more efficient to batch this request with
   * the elevator's existing workload.
   *
   * σ = 2.0 (controls the "reach" of the cluster influence)
   */
  private clusterDensity(elevator: Elevator, request: Request): number {
    const sigma = 2.0;
    let density = 0;

    for (const r of elevator.requests) {
      const d1 = Math.abs(request.currentFloor - r.currentFloor);
      const d2 = Math.abs(request.targetFloor - r.targetFloor);
      density += Math.exp(-(d1 * d1) / (2 * sigma * sigma));
      density += Math.exp(-(d2 * d2) / (2 * sigma * sigma));
    }

    return density;
  }
}
