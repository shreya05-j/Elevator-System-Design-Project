from enum import Enum

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    IDLE = "IDLE"

class ElevatorState(str, Enum):
    MOVING = "MOVING"
    STOPPED = "STOPPED"
    MAINTENANCE = "MAINTENANCE"

class StrategyType(str, Enum):
    SCAN = "SCAN"
    SUSTAINABLE = "SUSTAINABLE"
