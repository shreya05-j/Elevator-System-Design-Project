import React from "react";
import { Request } from "../engine/Request";
import { Direction } from "../engine/types";
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";

interface RequestQueueProps {
  requests: Request[];
}

export const RequestQueue: React.FC<RequestQueueProps> = ({ requests }) => {
  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg-secondary/50">
        <Clock className="w-4 h-4 text-accent-amber" />
        <span className="text-xs font-bold text-text-secondary tracking-wider uppercase">
          Request Queue
        </span>
        <span className="ml-auto text-[10px] text-text-muted">
          {requests.length} total
        </span>
      </div>
      <div className="p-2 max-h-48 overflow-y-auto scrollbar-thin">
        {requests.length === 0 ? (
          <div className="text-text-muted text-xs italic text-center py-4">
            No requests yet
          </div>
        ) : (
          <div className="space-y-1">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] ${
                  req.serviced
                    ? "bg-accent-green/5 text-accent-green/70"
                    : req.pickedUp
                      ? "bg-accent-amber/5 text-accent-amber"
                      : "bg-bg-secondary text-text-secondary"
                }`}
              >
                {/* Status icon */}
                {req.serviced ? (
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                ) : req.pickedUp ? (
                  <Loader2 className="w-3 h-3 shrink-0 animate-spin" />
                ) : req.direction === Direction.UP ? (
                  <ArrowUp className="w-3 h-3 shrink-0 text-accent-blue" />
                ) : (
                  <ArrowDown className="w-3 h-3 shrink-0 text-accent-red" />
                )}

                {/* Request info */}
                <span className="font-mono font-medium">
                  F{req.currentFloor} → F{req.targetFloor}
                </span>

                {/* Status badge */}
                <span className="ml-auto">
                  {req.serviced ? (
                    <span className="text-[9px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded-full">
                      Done
                    </span>
                  ) : req.pickedUp ? (
                    <span className="text-[9px] bg-accent-amber/20 text-accent-amber px-1.5 py-0.5 rounded-full">
                      In Transit
                    </span>
                  ) : (
                    <span className="text-[9px] bg-bg-hover text-text-muted px-1.5 py-0.5 rounded-full">
                      Waiting
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
