interface ProjectHealthBarsProps {
  metrics?: {
    velocity: number;
    alignment: number;
    quality: number;
  };
}

export function ProjectHealthBars({ metrics }: ProjectHealthBarsProps) {
  // Mock data slightly randomized if not provided
  const m = metrics || {
    velocity: Math.floor(Math.random() * 40) + 60,
    alignment: Math.floor(Math.random() * 30) + 70,
    quality: Math.floor(Math.random() * 50) + 50,
  };

  const getColorClass = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-end gap-0.5 h-3 opacity-80 shrink-0 group-hover:opacity-100 transition-opacity ml-2">
      <div 
        className={`w-1 rounded-t-[1px] ${getColorClass(m.velocity)}`} 
        style={{ height: `${Math.max(30, m.velocity)}%` }} 
        title={`Velocity: ${m.velocity}%`}
      />
      <div 
        className={`w-1 rounded-t-[1px] ${getColorClass(m.alignment)}`} 
        style={{ height: `${Math.max(30, m.alignment)}%` }}
        title={`Alignment: ${m.alignment}%`}
      />
      <div 
        className={`w-1 rounded-t-[1px] ${getColorClass(m.quality)}`} 
        style={{ height: `${Math.max(30, m.quality)}%` }}
        title={`Quality: ${m.quality}%`}
      />
    </div>
  );
}
