from .core.dispatcher import Dispatcher
from .core.types import StrategyType

# Initialize the global dispatcher with 2 elevators, to match frontend
global_dispatcher = Dispatcher(num_elevators=2, min_floor=0, max_floor=9, strategy_type=StrategyType.SCAN)
