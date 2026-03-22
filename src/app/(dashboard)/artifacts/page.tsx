"use client";

import { useState } from "react";
import { MOCK_ARTIFACTS } from "@/lib/mock-data";
import { ArtifactGrid } from "@/components/artifacts/ArtifactGrid";
import { ArtifactDetail } from "@/components/artifacts/ArtifactDetail";

export default function ArtifactsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Workspace Artifacts</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          All formal documents, plans, and memos produced by the council. Use these structured outputs to execute on decisions.
        </p>
      </div>
      
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 pb-12">
        <ArtifactGrid artifacts={MOCK_ARTIFACTS} onSelect={handleSelect} />
      </div>

      <ArtifactDetail 
        artifactId={selectedId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
