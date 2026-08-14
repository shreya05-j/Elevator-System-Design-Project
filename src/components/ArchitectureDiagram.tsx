import React from "react";
import { Box, GitBranch, Cpu, ArrowRightLeft, Layers } from "lucide-react";

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs font-bold text-text-secondary tracking-wider uppercase mb-3 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-accent-purple" />
        System Architecture — Strategy Pattern
      </h3>

      <div className="space-y-2">
        {/* Dispatcher */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-cyan shrink-0" />
          <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-accent-cyan" />
            <span className="font-semibold text-accent-cyan">Dispatcher</span>
            <span className="text-text-muted">→ Orchestrates requests & elevators</span>
          </div>
        </div>

        {/* Strategy */}
        <div className="flex items-center gap-2 pl-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-purple shrink-0" />
          <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
            <GitBranch className="w-3 h-3 text-accent-purple" />
            <span className="font-semibold text-accent-purple">RoutingStrategy</span>
            <span className="text-text-muted">← Abstract base (hot-swappable)</span>
          </div>
        </div>

        {/* Implementations */}
        <div className="flex items-center gap-2 pl-8">
          <div className="w-1 h-1 rounded-full bg-accent-blue shrink-0" />
          <div className="text-[10px] text-accent-blue flex items-center gap-1">
            <ArrowRightLeft className="w-2.5 h-2.5" />
            ScanRoutingStrategy — LOOK/SCAN disk-arm algorithm
          </div>
        </div>
        <div className="flex items-center gap-2 pl-8">
          <div className="w-1 h-1 rounded-full bg-accent-green shrink-0" />
          <div className="text-[10px] text-accent-green flex items-center gap-1">
            <ArrowRightLeft className="w-2.5 h-2.5" />
            SustainableRoutingStrategy — Energy-optimized (Sus-XAI)
          </div>
        </div>

        {/* Elevator + Request */}
        <div className="flex items-center gap-2 pl-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-amber shrink-0" />
          <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
            <Box className="w-3 h-3 text-accent-amber" />
            <span className="font-semibold text-accent-amber">Elevator[]</span>
            <span className="text-text-muted">— State, queue, passengers</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-red shrink-0" />
          <div className="text-[11px] text-text-secondary flex items-center gap-1.5">
            <Box className="w-3 h-3 text-accent-red" />
            <span className="font-semibold text-accent-red">Request</span>
            <span className="text-text-muted">— from→to, direction, status</span>
          </div>
        </div>
      </div>
    </div>
  );
};
