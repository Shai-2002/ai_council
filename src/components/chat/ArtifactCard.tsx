"use client";

import { Role } from "@/types";
import { onViewArtifact, onFinalizeArtifact } from "@/lib/placeholder";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2 } from "lucide-react";

export function ArtifactCard({ role }: { role: Role }) {
  return (
    <div className="flex w-full mb-6 justify-start pl-12 pr-4 sm:pr-0 sm:max-w-[75%]">
      <div className={`w-full rounded-xl border ${role.border} bg-white dark:bg-zinc-950 shadow-sm overflow-hidden`}>
        {/* Header */}
        <div className={`px-4 py-3 border-b ${role.border} ${role.bgLight} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${role.bgDark} text-white`}>
              <FileText className="h-4 w-4" />
            </div>
            <span className={`text-sm font-semibold ${role.text}`}>{role.artifactType} prepared</span>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Draft
          </span>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Launch timeline: 6 weeks with 3 features
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
            The 6-week timeline balances speed with quality. 3 features is the minimum that creates a testable value proposition...
          </p>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewArtifact("1")}
              className={`${role.border} ${role.text} hover:opacity-80 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900`}
            >
              View Full Memo
            </Button>
            <Button 
              size="sm"
              onClick={() => onFinalizeArtifact("1")}
              className={`${role.bgDark} text-white hover:opacity-90`}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Finalize Decision
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
