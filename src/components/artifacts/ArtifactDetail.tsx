"use client";

import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/roles-config";
import { onFinalizeArtifact } from "@/lib/placeholder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, FileText } from "lucide-react";
import type { Artifact } from "@/types";

export function ArtifactDetail({
  artifactId,
  artifact: artifactProp,
  open,
  onOpenChange
}: {
  artifactId: string | null;
  artifact?: Artifact | null;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const artifact = artifactProp ?? null;

  if (!artifact || !artifactId) return null;

  const role = ROLES[artifact.roleSlug];
  if (!role || !artifact.structuredData) return null;

  const structuredData = artifact.structuredData as {
    context?: string;
    options?: { option: string; pros: string[]; cons: string[] }[];
    decision?: string;
    rationale?: string;
    risks?: string[];
    next_steps?: string[];
    // Other artifact types
    objective?: string;
    summary?: string;
    problem?: string;
    positioning?: string;
    [key: string]: unknown;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col gap-0 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">

        {/* Header */}
        <div className={`p-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-4 shrink-0`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm font-semibold rounded-full px-3 py-1 bg-white dark:bg-zinc-950 border ${role.border} ${role.text}`}>
              <FileText className="h-4 w-4" />
              {role.artifactType}
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              artifact.status === "final"
                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
            }`}>
              {artifact.status.charAt(0).toUpperCase() + artifact.status.slice(1)}
            </span>
          </div>

          <div>
            <DialogTitle className="text-2xl font-bold leading-tight mb-2 text-zinc-900 dark:text-zinc-100">
              {artifact.title}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Prepared by {role.name}, {role.title} • {new Date(artifact.createdAt).toLocaleDateString()}
            </DialogDescription>
          </div>
        </div>

        {/* Content Body */}
        <ScrollArea className="flex-1 px-6 py-6 bg-white dark:bg-zinc-950">
          <div className="max-w-2xl mx-auto space-y-10 pb-10">

            {/* Context Section */}
            {structuredData.context && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Context</h4>
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                  {structuredData.context}
                </p>
              </section>
            )}

            {/* Objective/Summary/Problem */}
            {(structuredData.objective || structuredData.summary || structuredData.problem) && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  {structuredData.objective ? 'Objective' : structuredData.summary ? 'Summary' : 'Problem'}
                </h4>
                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">
                  {structuredData.objective || structuredData.summary || structuredData.problem}
                </p>
              </section>
            )}

            {/* Options Section (Decision Memo) */}
            {structuredData.options && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Evaluated Options</h4>
                <div className="grid gap-4">
                  {structuredData.options.map((opt: {option: string, pros: string[], cons: string[]}, i: number) => (
                    <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-4">
                      <h5 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{opt.option}</h5>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700 dark:text-green-400 font-medium mb-1.5 block">Pros</span>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-700 dark:text-zinc-300">
                            {opt.pros.map((pro: string, idx: number) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-red-700 dark:text-red-400 font-medium mb-1.5 block">Cons</span>
                          <ul className="list-disc pl-4 space-y-1 text-zinc-700 dark:text-zinc-300">
                            {opt.cons.map((con: string, idx: number) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Decision Section */}
            {structuredData.decision && (
              <section className={`rounded-xl border-l-4 p-5 ${role.bgLight} border-${role.color}-500 dark:border-${role.color}-500`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${role.text}`}>Recommendation</h4>
                <p className="font-semibold text-base text-zinc-900 dark:text-zinc-100 mb-4">
                  {structuredData.decision}
                </p>
                {structuredData.rationale && (
                  <>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${role.text} opacity-80`}>Rationale</h4>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      {structuredData.rationale}
                    </p>
                  </>
                )}
              </section>
            )}

            {/* Next Steps & Risks */}
            {(structuredData.next_steps || structuredData.risks) && (
              <div className="grid sm:grid-cols-2 gap-8">
                {structuredData.next_steps && (
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Next Steps</h4>
                    <ul className="space-y-2">
                      {structuredData.next_steps.map((step: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                          <div className="mt-0.5 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-[10px] shrink-0 font-medium">{i + 1}</div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {structuredData.risks && (
                  <section>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Identified Risks</h4>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-zinc-800 dark:text-zinc-200">
                      {structuredData.risks.map((risk: string, i: number) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}

            {/* Generic JSON display for other artifact types */}
            {!structuredData.context && !structuredData.decision && !structuredData.options && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Details</h4>
                <pre className="text-sm text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(artifact.structuredData, null, 2)}
                </pre>
              </section>
            )}

          </div>
        </ScrollArea>

        {/* Footer Actions */}
        {artifact.status === "draft" && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end shrink-0">
            <Button
              onClick={() => {
                onFinalizeArtifact(artifact.id);
                onOpenChange(false);
              }}
              className={`${role.bgDark} text-white hover:opacity-90`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalize this {role.artifactType}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
