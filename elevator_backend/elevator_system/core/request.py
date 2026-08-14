import uuid
from .types import Direction

class Request:
    def __init__(self, current_floor: int, target_floor: int):
        self.id = str(uuid.uuid4())
        self.current_floor = current_floor
        self.target_floor = target_floor
        self.picked_up = False
        self.serviced = False
        self.direction = Direction.UP if target_floor > current_floor else Direction.DOWN

    def to_dict(self):
        return {
            "id": self.id,
            "currentFloor": self.current_floor,
            "targetFloor": self.target_floor,
            "pickedUp": self.picked_up,
            "serviced": self.serviced,
            "direction": self.direction.value
        }

    def __str__(self):
        return f"Req(F{self.current_floor}→F{self.target_floor})"
