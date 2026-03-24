import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VersionNavigatorProps {
  versionGroupId: string;
  currentVersion: number;
  totalVersions: number;
  onSwitchVersion: (version: number) => void;
}

export function VersionNavigator({
  currentVersion,
  totalVersions,
  onSwitchVersion,
}: VersionNavigatorProps) {
  if (totalVersions <= 1) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/30 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30"
        disabled={currentVersion <= 1}
        onClick={() => onSwitchVersion(currentVersion - 1)}
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      <span className="min-w-[3ch] text-center">
        {currentVersion} <span className="text-zinc-400 font-normal mx-0.5">of</span> {totalVersions}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30"
        disabled={currentVersion >= totalVersions}
        onClick={() => onSwitchVersion(currentVersion + 1)}
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
