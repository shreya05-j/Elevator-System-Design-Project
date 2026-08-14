import React from "react";
import { ElevatorSnapshot } from "../engine/Elevator";
import { Direction, ElevatorState } from "../engine/types";
import { ArrowUp, ArrowDown, Pause, Wrench, Users } from "lucide-react";

interface ElevatorShaftProps {
  elevator: ElevatorSnapshot;
  totalFloors: number;
  minFloor: number;
}

export const ElevatorShaft: React.FC<ElevatorShaftProps> = ({
  elevator,
  totalFloors,
  minFloor,
}) => {
  const floorCount = totalFloors;
  const floorHeight = 100 / floorCount;
  // Position from bottom: floor 0 = bottom
  const carPosition = (elevator.currentFloor - minFloor) * floorHeight;

  const dirIcon =
    elevator.direction === Direction.UP ? (
      <ArrowUp className="w-3.5 h-3.5" />
    ) : elevator.direction === Direction.DOWN ? (
      <ArrowDown className="w-3.5 h-3.5" />
    ) : (
      <Pause className="w-3.5 h-3.5" />
    );

  const stateColor =
    elevator.state === ElevatorState.MOVING
      ? "from-blue-500 to-cyan-400"
      : elevator.state === ElevatorState.MAINTENANCE
        ? "from-red-500 to-orange-400"
        : elevator.direction !== Direction.IDLE
          ? "from-amber-500 to-yellow-400"
          : "from-emerald-500 to-green-400";

  const carBorderColor =
    elevator.state === ElevatorState.MOVING
      ? "border-blue-400/60"
      : elevator.state === ElevatorState.MAINTENANCE
        ? "border-red-400/60"
        : elevator.direction !== Direction.IDLE
          ? "border-amber-400/60"
          : "border-emerald-400/60";

  const glowColor =
    elevator.state === ElevatorState.MOVING
      ? "shadow-blue-500/30"
      : elevator.state === ElevatorState.MAINTENANCE
        ? "shadow-red-500/30"
        : "shadow-emerald-500/20";

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Header */}
      <div className="text-center">
        <div className="text-xs font-bold text-text-secondary tracking-wider uppercase">
          {elevator.name}
        </div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br ${stateColor} text-white`}
          >
            {elevator.state === ElevatorState.MAINTENANCE ? (
              <Wrench className="w-3 h-3" />
            ) : (
              dirIcon
            )}
          </span>
          <span className="text-[10px] text-text-muted font-medium">
            F{elevator.currentFloor}
          </span>
        </div>
      </div>

      {/* Shaft */}
      <div
        className="elevator-shaft relative rounded-lg overflow-hidden"
        style={{ width: 56, height: 320 }}
      >
        {/* Floor lines */}
        {Array.from({ length: floorCount }).map((_, i) => (
          <div
            key={i}
            className="floor-line absolute left-0 right-0 flex items-center"
            style={{
              bottom: `${i * floorHeight}%`,
              height: `${floorHeight}%`,
            }}
          >
            <span className="text-[8px] text-text-muted/50 pl-1 absolute bottom-0 left-0">
              {minFloor + i}
            </span>
          </div>
        ))}

        {/* Target floor indicators */}
        {elevator.targetFloors.map((floor) => (
          <div
            key={floor}
            className="absolute left-0 right-0 opacity-40"
            style={{
              bottom: `${(floor - minFloor) * floorHeight}%`,
              height: `${floorHeight}%`,
            }}
          >
            <div className="w-full h-full bg-amber-500/20 border-l-2 border-amber-500/50" />
          </div>
        ))}

        {/* Elevator car */}
        <div
          className={`elevator-car absolute left-1 right-1 rounded-sm border ${carBorderColor} bg-gradient-to-br ${stateColor} shadow-lg ${glowColor} flex items-center justify-center`}
          style={{
            bottom: `${carPosition}%`,
            height: `${floorHeight}%`,
            minHeight: 20,
          }}
        >
          {elevator.passengerCount > 0 && (
            <div className="flex items-center gap-0.5 text-white">
              <Users className="w-3 h-3" />
              <span className="text-[9px] font-bold">
                {elevator.passengerCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-0.5">
        <div className="text-[9px] text-text-muted">
          Stops: <span className="text-text-secondary font-medium">{elevator.totalStops}</span>
        </div>
        <div className="text-[9px] text-text-muted">
          Dist: <span className="text-text-secondary font-medium">{elevator.totalDistance}</span>
        </div>
        <div className="text-[9px] text-text-muted">
          Motor: <span className="text-text-secondary font-medium">{elevator.motorStarts}</span>
        </div>
      </div>
    </div>
  );
};
