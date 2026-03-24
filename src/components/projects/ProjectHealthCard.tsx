import { Activity, Target, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface HealthMetrics {
  velocity: number;
  alignment: number;
  quality: number;
  risk: number;
  completion: number;
}

interface ProjectHealthCardProps {
  metrics?: HealthMetrics;
}

export function ProjectHealthCard({ metrics }: ProjectHealthCardProps) {
  // Mock data if none provided
  const m = metrics || {
    velocity: 85,
    alignment: 92,
    quality: 78,
    risk: 25,
    completion: 60,
  };

  const getMetricColor = (value: number, reverse: boolean = false) => {
    if (reverse) {
      if (value < 30) return "text-emerald-500";
      if (value < 70) return "text-amber-500";
      return "text-red-500";
    }
    if (value >= 80) return "text-emerald-500";
    if (value >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = (value: number, reverse: boolean = false) => {
    if (reverse) {
      if (value < 30) return "bg-emerald-500";
      if (value < 70) return "bg-amber-500";
      return "bg-red-500";
    }
    if (value >= 80) return "bg-emerald-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const indicators = [
    { label: "Velocity", value: m.velocity, icon: Activity, reverse: false },
    { label: "AI Alignment", value: m.alignment, icon: Target, reverse: false },
    { label: "Quality", value: m.quality, icon: Shield, reverse: false },
    { label: "Risk Level", value: m.risk, icon: AlertTriangle, reverse: true },
    { label: "Completion", value: m.completion, icon: CheckCircle2, reverse: false },
  ];

  const overallHealth = Math.round((m.velocity + m.alignment + m.quality + (100 - m.risk)) / 4);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Project Health</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">AI-generated metrics based on recent chat activity.</p>
        </div>
        <div className={`flex flex-col items-end`}>
          <span className={`text-3xl font-bold tracking-tight ${getMetricColor(overallHealth)}`}>
            {overallHealth}
          </span>
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {indicators.map((ind, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                <ind.icon className="h-4 w-4 opacity-70" />
                <span>{ind.label}</span>
              </div>
              <span className={`font-bold ${getMetricColor(ind.value, ind.reverse)}`}>
                {ind.value}%
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(ind.value, ind.reverse)}`}
                style={{ width: `${ind.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
