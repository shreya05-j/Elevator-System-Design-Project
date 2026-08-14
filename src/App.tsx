import { useState, useCallback, useRef, useEffect } from "react";
import { SystemSnapshot } from "./engine/Dispatcher";
import { StrategyType } from "./engine/types";
import { Request } from "./engine/Request";
import { ElevatorShaft } from "./components/ElevatorShaft";
import { LogPanel } from "./components/LogPanel";
import { StatsPanel } from "./components/StatsPanel";
import { ControlPanel } from "./components/ControlPanel";
import { RequestPanel } from "./components/RequestPanel";
import { RequestQueue } from "./components/RequestQueue";
import { ArchitectureDiagram } from "./components/ArchitectureDiagram";
import { Building2, Code2, Sparkles } from "lucide-react";

const MIN_FLOOR = 0;
const MAX_FLOOR = 9;
const NUM_ELEVATORS = 2;
const TOTAL_FLOORS = MAX_FLOOR - MIN_FLOOR + 1;

function randomFloor(): number {
  return Math.floor(Math.random() * TOTAL_FLOORS) + MIN_FLOOR;
}

export default function App() {
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.SCAN);
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);

  // Connect to Django Channels WebSocket Backend
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8001/ws/elevator/");
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "initial_state" || data.type === "state_update") {
         setSnapshot(data.snapshot);
         setLogs(data.snapshot.logs || []);
         setAllRequests(data.snapshot.allRequests || []);
         
         if (data.snapshot.isComplete) {
             setIsRunning(false);
             ws.current?.send(JSON.stringify({ action: "toggleRun", isRunning: false }));
         }
      }
    };

    return () => {
        ws.current?.close();
    };
  }, []);

  // --- Strategy switch ---
  const handleStrategyChange = useCallback(
    (s: StrategyType) => {
      setStrategy(s);
      setIsRunning(false);
      ws.current?.send(JSON.stringify({ action: "toggleRun", isRunning: false }));
      ws.current?.send(JSON.stringify({ action: "switchStrategy", strategy: s }));
    },
    []
  );

  // --- Add request ---
  const handleAddRequest = useCallback(
    (from: number, to: number) => {
      ws.current?.send(JSON.stringify({ action: "addRequest", from, to }));
    },
    []
  );

  // --- Add random requests ---
  const handleAddRandomRequests = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      let from = randomFloor();
      let to = randomFloor();
      while (to === from) to = randomFloor();
      ws.current?.send(JSON.stringify({ action: "addRequest", from, to }));
    }
  }, []);

  // --- Load preset ---
  const handleLoadPreset = useCallback(() => {
    setIsRunning(false);
    ws.current?.send(JSON.stringify({ action: "toggleRun", isRunning: false }));
    ws.current?.send(JSON.stringify({ action: "reset" }));
    
    // Slight delay to ensure reset is processed before adding requests
    setTimeout(() => {
        const scenarios = [
            [0, 7], [3, 9], [8, 1], [5, 0], [2, 6],
        ];
        for (const [from, to] of scenarios) {
            ws.current?.send(JSON.stringify({ action: "addRequest", from, to }));
        }
    }, 100);
  }, []);

  // --- Step ---
  const handleStep = useCallback(() => {
    ws.current?.send(JSON.stringify({ action: "step" }));
  }, []);

  // --- Run / Pause ---
  const handleToggleRun = useCallback(() => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    ws.current?.send(JSON.stringify({ action: "toggleRun", isRunning: nextState }));
  }, [isRunning]);

  // --- Reset ---
  const handleReset = useCallback(() => {
    setIsRunning(false);
    ws.current?.send(JSON.stringify({ action: "toggleRun", isRunning: false }));
    ws.current?.send(JSON.stringify({ action: "reset" }));
  }, []);

  const hasRequests = allRequests.length > 0;

  if (!snapshot) {
      return (
          <div className="min-h-screen bg-bg-primary flex items-center justify-center">
              <div className="text-accent-blue font-mono">Connecting to backend...</div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-bg-secondary/60 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-blue/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-tight">
                Elevator Management System
              </h1>
              <p className="text-[10px] text-text-muted">
                Low-Level Design — Strategy Pattern · SCAN & Sus-XAI Algorithms
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[10px] text-text-muted font-medium">
              OOD · Type-Safe · Production-Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Stats Bar */}
        <StatsPanel snapshot={snapshot} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar — Controls */}
          <div className="lg:col-span-3 space-y-4">
            <ControlPanel
              strategy={strategy}
              onStrategyChange={handleStrategyChange}
              onStep={handleStep}
              onRun={() => {}}
              onReset={handleReset}
              isRunning={isRunning}
              isComplete={snapshot.isComplete && hasRequests}
              onToggleRun={handleToggleRun}
            />

            <RequestPanel
              minFloor={MIN_FLOOR}
              maxFloor={MAX_FLOOR}
              onAddRequest={handleAddRequest}
              onAddRandomRequests={handleAddRandomRequests}
              disabled={isRunning}
            />

            {/* Preset Button */}
            <button
              onClick={handleLoadPreset}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 hover:from-accent-purple/30 hover:to-accent-blue/30 border border-accent-purple/30 text-accent-purple text-xs font-semibold rounded-xl px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Demo Scenario (5 requests)
            </button>

            <ArchitectureDiagram />
          </div>

          {/* Center — Elevator Visualization */}
          <div className="lg:col-span-5">
            <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-text-secondary tracking-wider uppercase flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-accent-blue" />
                  Elevator Shafts
                </h2>
                <div className="text-[10px] text-text-muted">
                  {TOTAL_FLOORS} floors · {NUM_ELEVATORS} cars
                </div>
              </div>

              {/* Floor labels + Shafts */}
              <div className="flex items-start justify-center gap-6 sm:gap-10">
                {/* Floor scale */}
                <div
                  className="flex flex-col justify-between py-0"
                  style={{ height: 320 }}
                >
                  {Array.from({ length: TOTAL_FLOORS })
                    .map((_, i) => MAX_FLOOR - i)
                    .map((floor) => (
                      <div
                        key={floor}
                        className="text-[10px] text-text-muted font-mono text-right pr-1 leading-none"
                      >
                        F{floor}
                      </div>
                    ))}
                </div>

                {/* Elevator shafts */}
                {snapshot.elevators.map((elev) => (
                  <ElevatorShaft
                    key={elev.id}
                    elevator={elev}
                    totalFloors={TOTAL_FLOORS}
                    minFloor={MIN_FLOOR}
                  />
                ))}
              </div>

              {/* Strategy Description */}
              <div className="mt-4 bg-bg-secondary/50 rounded-lg px-3 py-2 border border-border">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">
                  Active Strategy
                </div>
                <div className="text-xs text-text-secondary font-medium">
                  {snapshot.strategyName}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                  {snapshot.strategyDescription}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar — Logs & Queue */}
          <div className="lg:col-span-4 space-y-4">
            <RequestQueue requests={allRequests} />
            <LogPanel logs={logs} />
          </div>
        </div>

        {/* Algorithm Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AlgorithmCard
            title="SCAN / LOOK Algorithm"
            color="accent-blue"
            formulae={[
              "S_above = { s ∈ S | s > F }",
              "S_below = { s ∈ S | s < F }",
              "If dir=UP ∧ |S_above|>0 → continue UP",
              "If dir=UP ∧ |S_above|=0 → reverse to DOWN",
              "IDLE: nearest = argmin|s−F| → set direction",
              "Cost(e,r) = |e.floor − r.floor| + penalty(dir)",
            ]}
            description="Modeled after the disk-arm LOOK algorithm. The elevator sweeps in one direction servicing all aligned requests, then reverses. Minimizes total seek distance."
          />
          <AlgorithmCard
            title="Sustainable (Sus-XAI) Routing"
            color="accent-green"
            formulae={[
              "E_total = k₁·Σ|moves| + k₂·motor_starts + k₃·idle",
              "DCS(e,r) = sign(e.dir) × sign(r.floor − e.floor)",
              "E_up = 1.0× , E_down = 0.7× (regen braking)",
              "Density(f) = Σ exp(−|f − rᵢ|² / 2σ²)",
              "Cost = E_dist + motor_penalty − DCS·2 − cluster·1.5",
              "IDLE preference: DOWN (gravity-assisted)",
            ]}
            description="Designed for the Sus-XAI framework. Optimizes for energy efficiency by minimizing motor starts, leveraging gravitational preference, directional coherence scoring, and Gaussian cluster density analysis."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4 text-center">
        <p className="text-[10px] text-text-muted">
          Elevator Management System — Low-Level Design · Strategy Pattern · Built with TypeScript + React + Django Channels
        </p>
      </footer>
    </div>
  );
}

/** Reusable card for displaying algorithm mathematics. */
function AlgorithmCard({
  title,
  color,
  formulae,
  description,
}: {
  title: string;
  color: string;
  formulae: string[];
  description: string;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <h3 className={`text-xs font-bold text-${color} tracking-wider uppercase mb-2`}>
        {title}
      </h3>
      <p className="text-[11px] text-text-muted leading-relaxed mb-3">
        {description}
      </p>
      <div className="bg-bg-primary/60 rounded-lg p-3 space-y-1 font-mono border border-border">
        {formulae.map((f, i) => (
          <div key={i} className="text-[10px] text-text-secondary">
            <span className="text-text-muted mr-1.5 select-none">{i + 1}.</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
