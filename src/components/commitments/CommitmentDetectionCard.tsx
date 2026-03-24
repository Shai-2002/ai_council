import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, X } from "lucide-react";

interface CommitmentDetectionCardProps {
  extractedRule: string;
  onConfirm: (scope: "workspace" | "project") => void;
  onDismiss: () => void;
}

export function CommitmentDetectionCard({
  extractedRule,
  onConfirm,
  onDismiss,
}: CommitmentDetectionCardProps) {
  const [scope, setScope] = useState<"workspace" | "project">("workspace");
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    onConfirm(scope);
    setSaving(false);
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 shadow-sm rounded-2xl rounded-tl-sm p-4 w-full relative mt-2">
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-500 font-semibold mb-3">
        <ClipboardList className="h-4 w-4" />
        <span>Rule Detected</span>
      </div>
      
      <div className="bg-white/60 dark:bg-zinc-950/50 rounded-lg p-3 text-sm text-zinc-900 dark:text-zinc-100 font-medium italic border border-amber-100 dark:border-amber-900/50 mb-4">
        &ldquo;{extractedRule}&rdquo;
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 text-sm text-amber-900 dark:text-amber-400">
        <span className="font-medium">Apply to:</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input 
            type="radio" 
            name="ruleScope" 
            checked={scope === "project"}
            onChange={() => setScope("project")}
            className="accent-amber-600 w-3.5 h-3.5"
          />
          <span>This project</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input 
            type="radio" 
            name="ruleScope" 
            checked={scope === "workspace"}
            onChange={() => setScope("workspace")}
            className="accent-amber-600 w-3.5 h-3.5"
          />
          <span>Entire workspace</span>
        </label>
      </div>
      
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDismiss} className="text-amber-700 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/40">
          Dismiss
        </Button>
        <Button size="sm" onClick={handleConfirm} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
          {saving ? "Saving..." : "Confirm Rule"}
        </Button>
      </div>
    </div>
  );
}
