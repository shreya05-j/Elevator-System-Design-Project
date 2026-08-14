from .types import Direction, ElevatorState
from .request import Request

class Elevator:
    def __init__(self, id: int, start_floor: int = 0, min_floor: int = 0, max_floor: int = 9):
        self.id = id
        self.name = f"E{id}"
        self.current_floor = start_floor
        self.direction = Direction.IDLE
        self.state = ElevatorState.STOPPED
        self.requests = []
        self.min_floor = min_floor
        self.max_floor = max_floor

        self.total_stops = 0
        self.total_distance = 0
        self.motor_starts = 0
        self.idle_steps = 0
        self.passengers = []

    @property
    def is_idle(self) -> bool:
        return len(self.requests) == 0 and len(self.passengers) == 0 and self.direction == Direction.IDLE

    @property
    def target_floors(self) -> list[int]:
        pickups = [r.current_floor for r in self.requests if not r.picked_up]
        dropoffs = [r.target_floor for r in self.passengers]
        return list(set(pickups + dropoffs))

    def assign_request(self, request: Request):
        self.requests.append(request)

    def step(self) -> list[str]:
        logs = []

        if self.state == ElevatorState.MAINTENANCE:
            logs.append(f"{self.name}: 🔧 In maintenance")
            return logs

        # Pick up passengers
        pickups = [r for r in self.requests if not r.picked_up and r.current_floor == self.current_floor]
        for req in pickups:
            req.picked_up = True
            self.passengers.append(req)
            logs.append(f"{self.name}: 🚶 Picked up passenger at F{self.current_floor} → F{req.target_floor}")
            self.total_stops += 1

        # Drop off passengers
        dropoffs = [r for r in self.passengers if r.target_floor == self.current_floor]
        for req in dropoffs:
            req.serviced = True
            logs.append(f"{self.name}: ✅ Dropped off passenger at F{self.current_floor}")
            self.total_stops += 1
            
        self.passengers = [r for r in self.passengers if r.target_floor != self.current_floor]
        self.requests = [r for r in self.requests if not r.serviced]

        # Determine next move
        if not self.requests and not self.passengers:
            if self.direction != Direction.IDLE:
                logs.append(f"{self.name}: 💤 Now idle at F{self.current_floor}")
            self.direction = Direction.IDLE
            self.state = ElevatorState.STOPPED
            self.idle_steps += 1
            return logs

        prev_direction = self.direction
        if self.direction == Direction.UP:
            self.current_floor = min(self.current_floor + 1, self.max_floor)
            self.total_distance += 1
        elif self.direction == Direction.DOWN:
            self.current_floor = max(self.current_floor - 1, self.min_floor)
            self.total_distance += 1

        self.state = ElevatorState.MOVING

        if self.direction != Direction.IDLE and prev_direction == Direction.IDLE:
            self.motor_starts += 1

        dir_icon = "⬆️" if self.direction == Direction.UP else "⬇️" if self.direction == Direction.DOWN else "⏸️"
        logs.append(f"{self.name}: {dir_icon} Moved to F{self.current_floor}")

        return logs

    def snapshot(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "currentFloor": self.current_floor,
            "direction": self.direction.value,
            "state": self.state.value,
            "queueSize": len(self.requests),
            "passengerCount": len(self.passengers),
            "targetFloors": self.target_floors,
            "totalStops": self.total_stops,
            "totalDistance": self.total_distance,
            "motorStarts": self.motor_starts,
            "idleSteps": self.idle_steps,
        }
