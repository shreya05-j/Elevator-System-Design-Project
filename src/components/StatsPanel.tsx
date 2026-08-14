import React from "react";
import { SystemSnapshot } from "../engine/Dispatcher";
import {
  Activity,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  Gauge,
} from "lucide-react";

interface StatsPanelProps {
  snapshot: SystemSnapshot;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ snapshot }) => {
  const totalDist = snapshot.elevators.reduce(
    (s, e) => s + e.totalDistance,
    0
  );
  const totalMotorStarts = snapshot.elevators.reduce(
    (s, e) => s + e.motorStarts,
    0
  );
  const _totalStops = snapshot.elevators.reduce(
    (s, e) => s + e.totalStops,
    0
  );
  void _totalStops;

  // Energy model: E = k1 * distance + k2 * motorStarts
  const k1 = 1.0;
  const k2 = 3.0;
  const energyUsed = k1 * totalDist + k2 * totalMotorStarts;

  const stats = [
    {
      label: "Steps",
      value: snapshot.stepCount,
      icon: Clock,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      label: "Serviced",
      value: `${snapshot.servicedRequests}/${snapshot.totalRequests}`,
      icon: CheckCircle2,
      color: "text-accent-green",
      bg: "bg-accent-green/10",
    },
    {
      label: "In Transit",
      value: snapshot.inTransit,
      icon: TrendingUp,
      color: "text-accent-amber",
      bg: "bg-accent-amber/10",
    },
    {
      label: "Pending",
      value: snapshot.pendingRequests,
      icon: Activity,
      color: "text-accent-cyan",
      bg: "bg-accent-cyan/10",
    },
    {
      label: "Total Dist",
      value: totalDist,
      icon: Gauge,
      color: "text-accent-purple",
      bg: "bg-accent-purple/10",
    },
    {
      label: "Energy",
      value: energyUsed.toFixed(1),
      icon: Zap,
      color: "text-accent-red",
      bg: "bg-accent-red/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-card border border-border rounded-lg px-3 py-2.5 text-center"
        >
          <div className={`flex items-center justify-center mb-1 ${stat.color}`}>
            <stat.icon className="w-3.5 h-3.5" />
          </div>
          <div className="text-base font-bold text-text-primary">
            {stat.value}
          </div>
          <div className="text-[9px] text-text-muted uppercase tracking-wider mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
