import React, { useState } from "react";
import { PlusCircle, Shuffle, ArrowRight } from "lucide-react";

interface RequestPanelProps {
  minFloor: number;
  maxFloor: number;
  onAddRequest: (from: number, to: number) => void;
  onAddRandomRequests: () => void;
  disabled: boolean;
}

export const RequestPanel: React.FC<RequestPanelProps> = ({
  minFloor,
  maxFloor,
  onAddRequest,
  onAddRandomRequests,
  disabled,
}) => {
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from !== to) {
      onAddRequest(from, to);
    }
  };

  const floors = Array.from(
    { length: maxFloor - minFloor + 1 },
    (_, i) => minFloor + i
  );

  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase mb-3">
        Add Request
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
              From Floor
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(Number(e.target.value))}
              disabled={disabled}
              className="w-full bg-bg-secondary border border-border-light rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue disabled:opacity-50"
            >
              {floors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-4 h-4 text-text-muted mt-4 shrink-0" />

          <div className="flex-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider block mb-1">
              To Floor
            </label>
            <select
              value={to}
              onChange={(e) => setTo(Number(e.target.value))}
              disabled={disabled}
              className="w-full bg-bg-secondary border border-border-light rounded-md px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue disabled:opacity-50"
            >
              {floors.map((f) => (
                <option key={f} value={f}>
                  Floor {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={disabled || from === to}
            className="flex-1 flex items-center justify-center gap-1.5 bg-accent-blue hover:bg-accent-blue/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add
          </button>
          <button
            type="button"
            onClick={onAddRandomRequests}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-1.5 bg-accent-purple hover:bg-accent-purple/80 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Random ×5
          </button>
        </div>
      </form>
    </div>
  );
};
