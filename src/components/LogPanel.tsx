import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface LogPanelProps {
  logs: string[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const colorize = (line: string): string => {
    if (line.startsWith("━━━")) return "text-accent-cyan font-bold";
    if (line.includes("📥")) return "text-accent-blue";
    if (line.includes("🚶")) return "text-accent-amber";
    if (line.includes("✅")) return "text-accent-green";
    if (line.includes("💤")) return "text-text-muted";
    if (line.includes("🔄")) return "text-accent-purple";
    if (line.includes("⬆️")) return "text-blue-300";
    if (line.includes("⬇️")) return "text-orange-300";
    if (line.includes("🔧")) return "text-accent-red";
    return "text-text-secondary";
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-bg-secondary/50">
        <Terminal className="w-4 h-4 text-accent-green" />
        <span className="text-xs font-bold text-text-secondary tracking-wider uppercase">
          Simulation Log
        </span>
        <span className="ml-auto text-[10px] text-text-muted">
          {logs.length} entries
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin min-h-0" style={{ maxHeight: 400 }}>
        {logs.length === 0 ? (
          <div className="text-text-muted text-xs italic text-center py-8">
            Add requests and run the simulation to see logs here...
          </div>
        ) : (
          <div className="space-y-0.5 font-mono">
            {logs.map((line, i) => (
              <div
                key={i}
                className={`text-[11px] leading-relaxed animate-fade-in ${colorize(line)}`}
              >
                {line}
              </div>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
