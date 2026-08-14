import React from "react";
import { StrategyType } from "../engine/types";
import {
  Play,
  SkipForward,
  RotateCcw,
  Pause,
  FastForward,
} from "lucide-react";

interface ControlPanelProps {
  strategy: StrategyType;
  onStrategyChange: (s: StrategyType) => void;
  onStep: () => void;
  onRun: () => void;
  onReset: () => void;
  isRunning: boolean;
  isComplete: boolean;
  onToggleRun: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  strategy,
  onStrategyChange,
  onStep,
  onReset,
  isRunning,
  isComplete,
  onToggleRun,
}) => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Strategy Selector */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase mb-2">
          Routing Strategy
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onStrategyChange(StrategyType.SCAN)}
            className={`relative text-xs font-semibold rounded-lg px-3 py-2.5 border transition-all ${
              strategy === StrategyType.SCAN
                ? "bg-accent-blue/15 border-accent-blue text-accent-blue shadow-md shadow-accent-blue/10"
                : "bg-bg-secondary border-border-light text-text-muted hover:text-text-secondary hover:border-border-light"
            }`}
          >
            <div className="font-bold">SCAN</div>
            <div className="text-[9px] opacity-70 mt-0.5">LOOK Algorithm</div>
          </button>
          <button
            onClick={() => onStrategyChange(StrategyType.SUSTAINABLE)}
            className={`relative text-xs font-semibold rounded-lg px-3 py-2.5 border transition-all ${
              strategy === StrategyType.SUSTAINABLE
                ? "bg-accent-green/15 border-accent-green text-accent-green shadow-md shadow-accent-green/10"
                : "bg-bg-secondary border-border-light text-text-muted hover:text-text-secondary hover:border-border-light"
            }`}
          >
            <div className="font-bold">Sus-XAI</div>
            <div className="text-[9px] opacity-70 mt-0.5">Sustainable</div>
          </button>
        </div>
      </div>

      {/* Simulation Controls */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase mb-2">
          Controls
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onStep}
            disabled={isRunning || isComplete}
            className="flex-1 flex items-center justify-center gap-1.5 bg-bg-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed border border-border-light text-text-secondary text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Step
          </button>
          <button
            onClick={onToggleRun}
            disabled={isComplete}
            className={`flex-1 flex items-center justify-center gap-1.5 ${
              isRunning
                ? "bg-accent-amber hover:bg-accent-amber/80"
                : "bg-accent-green hover:bg-accent-green/80"
            } disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg px-3 py-2 transition-colors`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Run
              </>
            )}
          </button>
          <button
            onClick={() => {
              onReset();
            }}
            className="flex items-center justify-center gap-1.5 bg-bg-secondary hover:bg-bg-hover border border-border-light text-text-secondary text-xs font-semibold rounded-lg px-3 py-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status */}
      {isComplete && (
        <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-lg px-3 py-2">
          <FastForward className="w-4 h-4 text-accent-green" />
          <span className="text-xs text-accent-green font-semibold">
            All requests serviced!
          </span>
        </div>
      )}
    </div>
  );
};
