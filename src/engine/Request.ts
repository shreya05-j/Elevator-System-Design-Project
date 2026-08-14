import { Direction } from "./types";

/**
 * Represents a single passenger request in the elevator system.
 *
 * A request encapsulates:
 *  - The floor where the passenger is waiting (`currentFloor`)
 *  - The floor the passenger wants to reach (`targetFloor`)
 *  - The computed direction of travel (`direction`)
 *  - A unique identifier and timestamp for tracking
 */
export class Request {
  public readonly id: string;
  public readonly currentFloor: number;
  public readonly targetFloor: number;
  public readonly direction: Direction;
  public readonly timestamp: number;
  public serviced: boolean = false;
  public pickedUp: boolean = false;

  constructor(currentFloor: number, targetFloor: number) {
    this.id = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.currentFloor = currentFloor;
    this.targetFloor = targetFloor;
    this.direction = this.computeDirection();
    this.timestamp = Date.now();
  }

  /**
   * Computes the travel direction from current to target floor.
   *
   * Mathematical logic:
   *   direction = sign(targetFloor - currentFloor)
   *   +1 → UP, -1 → DOWN, 0 → IDLE (same floor)
   */
  private computeDirection(): Direction {
    const delta = this.targetFloor - this.currentFloor;
    if (delta > 0) return Direction.UP;
    if (delta < 0) return Direction.DOWN;
    return Direction.IDLE;
  }

  /** The absolute number of floors this request spans. */
  get travelDistance(): number {
    return Math.abs(this.targetFloor - this.currentFloor);
  }

  toString(): string {
    return `[${this.id.slice(-4)}] F${this.currentFloor}→F${this.targetFloor} (${this.direction})`;
  }
}
