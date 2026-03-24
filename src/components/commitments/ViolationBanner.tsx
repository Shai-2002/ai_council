import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViolationBannerProps {
  ruleText: string;
  onOverride: () => void;
  onUpdateRule: () => void;
}

export function ViolationBanner({
  ruleText,
  onOverride,
  onUpdateRule,
}: ViolationBannerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3 mb-3">
      <div className="flex items-start sm:items-center gap-2 flex-1">
        <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5 sm:mt-0" />
        <span className="text-xs sm:text-sm text-red-800 dark:text-red-400 font-medium">
          This response may conflict with your rule: <span className="italic">&ldquo;{ruleText}&rdquo;</span>
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onOverride} className="h-7 text-xs border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40">
          Override once
        </Button>
        <Button size="sm" onClick={onUpdateRule} className="h-7 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-400 border-0">
          Update rule
        </Button>
      </div>
    </div>
  );
}
