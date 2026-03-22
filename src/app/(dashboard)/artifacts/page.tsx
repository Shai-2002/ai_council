"use client";

import { useState, useEffect } from "react";
import { ArtifactGrid } from "@/components/artifacts/ArtifactGrid";
import { ArtifactDetail } from "@/components/artifacts/ArtifactDetail";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { createClient } from "@/lib/supabase/client";
import type { Artifact } from "@/types";

export default function ArtifactsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    async function fetchArtifacts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('artifacts')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (data) {
        setArtifacts(
          data.map((a) => ({
            id: a.id,
            roleSlug: a.role_slug,
            artifactType: a.artifact_type,
            title: a.title,
            status: a.status,
            createdAt: a.created_at,
            structuredData: a.structured_data,
          }))
        );
      }
      setLoading(false);
    }

    fetchArtifacts();
  }, [workspaceId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const selectedArtifact = artifacts.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Workspace Artifacts</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          All formal documents, plans, and memos produced by the council. Use these structured outputs to execute on decisions.
        </p>
      </div>

      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-zinc-400">Loading artifacts...</div>
          </div>
        ) : artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">No artifacts yet</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm max-w-md">
              Start chatting with your council members. When they generate structured outputs like Decision Memos or Execution Plans, they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <ArtifactGrid artifacts={artifacts} onSelect={handleSelect} />
        )}
      </div>

      {selectedArtifact && (
        <ArtifactDetail
          artifactId={selectedId}
          artifact={selectedArtifact}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
