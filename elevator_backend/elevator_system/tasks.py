import asyncio
from channels.layers import get_channel_layer
from .state import global_dispatcher

_system_task = None
_is_running = False

async def elevator_step_loop():
    global _is_running
    channel_layer = get_channel_layer()
    
    while True:
        if _is_running and not global_dispatcher.is_complete():
            global_dispatcher.step()

            await channel_layer.group_send(
                'elevator_updates',
                {
                    'type': 'system_update',
                    'state': {
                        'type': 'state_update',
                        'snapshot': global_dispatcher.snapshot()
                    }
                }
            )
        await asyncio.sleep(0.5)

def get_elevator_system_task():
    global _system_task
    if _system_task is None or _system_task.done():
        _system_task = asyncio.create_task(elevator_step_loop())
    return _system_task

def set_running(running: bool):
    global _is_running
    _is_running = running
