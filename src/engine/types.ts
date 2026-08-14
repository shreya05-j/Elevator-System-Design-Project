/**
 * Core Enumerations for the Elevator Management System.
 * These model the discrete states and directions of elevator motion.
 */

/** Direction of elevator travel or request intent. */
export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  IDLE = "IDLE",
}

/** Operational state of an individual elevator car. */
export enum ElevatorState {
  MOVING = "MOVING",
  STOPPED = "STOPPED",
  MAINTENANCE = "MAINTENANCE",
}

/** Identifies which routing strategy is active. */
export enum StrategyType {
  SCAN = "SCAN",
  SUSTAINABLE = "SUSTAINABLE",
}
