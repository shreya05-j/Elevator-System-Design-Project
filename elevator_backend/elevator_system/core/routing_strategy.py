import math
from .types import Direction
from .elevator import Elevator
from .request import Request

class RoutingStrategy:
    name = ""
    description = ""
    def assign_request(self, request: Request, elevators: list[Elevator]) -> int:
        raise NotImplementedError
    def compute_direction(self, elevator: Elevator):
        raise NotImplementedError

class ScanRoutingStrategy(RoutingStrategy):
    name = "SCAN (LOOK)"
    description = "Disk-arm algorithm: continues in current direction servicing all requests on the path, then reverses. Minimizes total seek time."

    def assign_request(self, request: Request, elevators: list[Elevator]) -> int:
        best_idx = 0
        best_cost = float('inf')
        max_floor = elevators[0].max_floor if elevators else 10

        for i, e in enumerate(elevators):
            distance = abs(e.current_floor - request.current_floor)
            penalty = 0
            if e.direction != Direction.IDLE:
                moving_toward = self._is_moving_toward(e.current_floor, e.direction, request.current_floor)
                if not moving_toward:
                    penalty = 2 * max_floor
                elif e.direction != request.direction:
                    penalty = max_floor * 0.5
            
            load_penalty = len(e.requests) * 0.5
            cost = distance + penalty + load_penalty
            if cost < best_cost:
                best_cost = cost
                best_idx = i

        return best_idx

    def compute_direction(self, elevator: Elevator):
        targets = elevator.target_floors
        if not targets:
            elevator.direction = Direction.IDLE
            return

        F = elevator.current_floor
        above = sorted([t for t in targets if t > F])
        below = sorted([t for t in targets if t < F], reverse=True)
        at_current = [t for t in targets if t == F]

        if at_current and not above and not below:
            elevator.direction = Direction.IDLE
            return

        if elevator.direction == Direction.UP:
            if above: elevator.direction = Direction.UP
            elif below: elevator.direction = Direction.DOWN
            else: elevator.direction = Direction.IDLE
        elif elevator.direction == Direction.DOWN:
            if below: elevator.direction = Direction.DOWN
            elif above: elevator.direction = Direction.UP
            else: elevator.direction = Direction.IDLE
        else:
            nearest = targets[0]
            min_dist = abs(targets[0] - F)
            for t in targets:
                d = abs(t - F)
                if d < min_dist:
                    min_dist = d
                    nearest = t
            if nearest > F:
                elevator.direction = Direction.UP
            elif nearest < F:
                elevator.direction = Direction.DOWN
            else:
                if above: elevator.direction = Direction.UP
                elif below: elevator.direction = Direction.DOWN
                else: elevator.direction = Direction.IDLE

    def _is_moving_toward(self, pos: int, dir: Direction, target: int) -> bool:
        if dir == Direction.UP: return target >= pos
        if dir == Direction.DOWN: return target <= pos
        return True

class SustainableRoutingStrategy(RoutingStrategy):
    name = "Sustainable (Sus-XAI)"
    description = "Energy-optimized: minimizes motor starts via request batching, directional coherence, and gravitational preference."

    UP_ENERGY_FACTOR = 1.0
    DOWN_ENERGY_FACTOR = 0.7
    MOTOR_START_PENALTY = 3.0

    def assign_request(self, request: Request, elevators: list[Elevator]) -> int:
        best_idx = 0
        best_energy_cost = float('inf')

        for i, e in enumerate(elevators):
            dcs = self._directional_coherence(e, request)
            raw_dist = request.current_floor - e.current_floor
            energy_dist = abs(raw_dist) * self.UP_ENERGY_FACTOR if raw_dist > 0 else abs(raw_dist) * self.DOWN_ENERGY_FACTOR

            motor_penalty = 0
            if e.direction != Direction.IDLE:
                would_reverse = (e.direction == Direction.UP and request.current_floor < e.current_floor) or \
                                (e.direction == Direction.DOWN and request.current_floor > e.current_floor)
                if would_reverse:
                    motor_penalty = self.MOTOR_START_PENALTY

            cluster_bonus = self._cluster_density(e, request)
            energy_cost = energy_dist + motor_penalty - (dcs * 2.0) - (cluster_bonus * 1.5)

            if energy_cost < best_energy_cost:
                best_energy_cost = energy_cost
                best_idx = i

        return best_idx

    def compute_direction(self, elevator: Elevator):
        targets = elevator.target_floors
        if not targets:
            elevator.direction = Direction.IDLE
            return

        F = elevator.current_floor
        above = [t for t in targets if t > F]
        below = [t for t in targets if t < F]

        if not above and not below:
            elevator.direction = Direction.IDLE
            return

        density_above = sum([math.exp(-abs(t - F) * 0.3) for t in above])
        density_below = sum([math.exp(-abs(t - F) * 0.3) for t in below])

        cost_above = (sum([t - F for t in above]) / len(above)) * self.UP_ENERGY_FACTOR if above else float('inf')
        cost_below = (sum([F - t for t in below]) / len(below)) * self.DOWN_ENERGY_FACTOR if below else float('inf')

        if elevator.direction == Direction.UP:
            elevator.direction = Direction.UP if above else Direction.DOWN
        elif elevator.direction == Direction.DOWN:
            elevator.direction = Direction.DOWN if below else Direction.UP
        else:
            score_above = density_above / (cost_above + 0.001)
            score_below = density_below / (cost_below + 0.001)

            if not above: elevator.direction = Direction.DOWN
            elif not below: elevator.direction = Direction.UP
            elif score_below >= score_above: elevator.direction = Direction.DOWN
            else: elevator.direction = Direction.UP

    def _directional_coherence(self, elevator: Elevator, request: Request) -> int:
        dir_vec = 1 if elevator.direction == Direction.UP else -1 if elevator.direction == Direction.DOWN else 0
        delta = request.current_floor - elevator.current_floor
        req_vec = 1 if delta > 0 else -1 if delta < 0 else 0
        return dir_vec * req_vec

    def _cluster_density(self, elevator: Elevator, request: Request) -> float:
        sigma = 2.0
        density = 0.0
        for r in elevator.requests:
            d1 = abs(request.current_floor - r.current_floor)
            d2 = abs(request.target_floor - r.target_floor)
            density += math.exp(-(d1 * d1) / (2 * sigma * sigma))
            density += math.exp(-(d2 * d2) / (2 * sigma * sigma))
        return density
