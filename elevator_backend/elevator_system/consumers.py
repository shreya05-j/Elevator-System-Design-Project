import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .state import global_dispatcher
from .core.types import StrategyType
from .tasks import get_elevator_system_task

class ElevatorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'elevator_updates'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        get_elevator_system_task()

        await self.send_system_state()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get("action")
            
            if action == "addRequest":
                from_floor = data.get("from")
                to_floor = data.get("to")
                if from_floor is not None and to_floor is not None:
                    global_dispatcher.add_request(int(from_floor), int(to_floor))
                    
            elif action == "switchStrategy":
                strategy = data.get("strategy")
                if strategy in [StrategyType.SCAN.value, StrategyType.SUSTAINABLE.value]:
                    global_dispatcher.switch_strategy(StrategyType(strategy))
                    
            elif action == "reset":
                global_dispatcher.__init__(num_elevators=2, min_floor=0, max_floor=9, strategy_type=global_dispatcher.strategy_type)
                
            elif action == "step":
                if not global_dispatcher.is_complete():
                    global_dispatcher.step()
                    
            elif action == "toggleRun":
                is_running = data.get("isRunning")
                from .tasks import set_running
                set_running(is_running)

            # Broadcast the updated state after any action immediately
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'system_update',
                    'state': {
                        'type': 'state_update',
                        'snapshot': global_dispatcher.snapshot()
                    }
                }
            )

        except (ValueError, TypeError, json.JSONDecodeError) as e:
            await self.send(text_data=json.dumps({
                'error': f'Invalid payload: {str(e)}'
            }))

    async def system_update(self, event):
        state = event['state']
        try:
            await self.send(text_data=json.dumps(state))
        except Exception:
            pass

    async def send_system_state(self):
        try:
            await self.send(text_data=json.dumps({
                "type": "initial_state",
                "snapshot": global_dispatcher.snapshot()
            }))
        except Exception:
            pass
