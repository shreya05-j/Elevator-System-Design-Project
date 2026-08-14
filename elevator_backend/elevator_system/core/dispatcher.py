from .elevator import Elevator
from .routing_strategy import RoutingStrategy, ScanRoutingStrategy, SustainableRoutingStrategy
from .types import StrategyType
from .request import Request

class Dispatcher:
    def __init__(self, num_elevators: int, min_floor: int = 0, max_floor: int = 9, strategy_type: StrategyType = StrategyType.SCAN):
        self.min_floor = min_floor
        self.max_floor = max_floor
        self.strategy_type = strategy_type
        
        self.elevators = [Elevator(id=i+1, min_floor=min_floor, max_floor=max_floor) for i in range(num_elevators)]
        self.strategy = self._create_strategy(strategy_type)
        
        self.step_count = 0
        self.logs = []
        self.all_requests = []

    def _create_strategy(self, strategy_type: StrategyType) -> RoutingStrategy:
        if strategy_type == StrategyType.SCAN:
            return ScanRoutingStrategy()
        elif strategy_type == StrategyType.SUSTAINABLE:
            return SustainableRoutingStrategy()
        return ScanRoutingStrategy()

    def switch_strategy(self, strategy_type: StrategyType):
        self.strategy_type = strategy_type
        self.strategy = self._create_strategy(strategy_type)
        self.logs.append(f"🔄 Strategy switched to: {self.strategy.name}")

    def add_request(self, current_floor: int, target_floor: int) -> Request:
        req = Request(current_floor, target_floor)
        self.all_requests.append(req)

        idx = self.strategy.assign_request(req, self.elevators)
        elevator = self.elevators[idx]
        elevator.assign_request(req)

        self.logs.append(f"📥 {str(req)} → assigned to {elevator.name}")
        return req

    def step(self):
        self.step_count += 1
        step_logs = [f"━━━ Step {self.step_count} ━━━"]

        for elevator in self.elevators:
            self.strategy.compute_direction(elevator)
            move_logs = elevator.step()
            step_logs.extend(move_logs)

        self.logs.extend(step_logs)

    def is_complete(self) -> bool:
        return all(e.is_idle for e in self.elevators)

    def snapshot(self) -> dict:
        return {
            "stepCount": self.step_count,
            "strategyName": self.strategy.name,
            "strategyDescription": self.strategy.description,
            "elevators": [e.snapshot() for e in self.elevators],
            "isComplete": self.is_complete(),
            "totalRequests": len(self.all_requests),
            "servicedRequests": len([r for r in self.all_requests if r.serviced]),
            "pendingRequests": len([r for r in self.all_requests if not r.serviced and not r.picked_up]),
            "inTransit": len([r for r in self.all_requests if r.picked_up and not r.serviced]),
            "logs": self.logs.copy(),
            "allRequests": [r.to_dict() for r in self.all_requests]
        }
