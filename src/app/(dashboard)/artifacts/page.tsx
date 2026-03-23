"use client";

import { useState, useEffect } from "react";
import { ArtifactGrid } from "@/components/artifacts/ArtifactGrid";
import { ArtifactDetail } from "@/components/artifacts/ArtifactDetail";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { createClient } from "@/lib/supabase/client";
import { ROLES } from "@/lib/roles-config";
import type { Artifact } from "@/types";
import type { ExtractedTask } from "@/lib/task-extraction";

export default function ArtifactsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [tasks, setTasks] = useState<ExtractedTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'artifacts' | 'tasks'>('artifacts');
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
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

      // Fetch tasks
      try {
        const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
        if (res.ok) {
          const taskData = await res.json();
          setTasks(taskData.tasks || []);
        }
      } catch { /* ignore */ }

      setLoading(false);
    }

    fetchData();
  }, [workspaceId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const selectedArtifact = artifacts.find((a) => a.id === selectedId) ?? null;

  // Group tasks by source artifact
  const tasksByArtifact = tasks.reduce((acc, task) => {
    const key = task.source_artifact_id;
    if (!acc[key]) acc[key] = { title: task.source_artifact_title || 'Unknown', role_slug: task.role_slug, tasks: [] };
    acc[key].tasks.push(task);
    return acc;
  }, {} as Record<string, { title: string; role_slug: string; tasks: ExtractedTask[] }>);

  const totalTasks = tasks.length;
  const completedCount = completedTasks.size;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-8 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Workspace Artifacts</h1>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('artifacts')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'artifacts'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Artifacts
            </button>
            <button
              onClick={() => setView('tasks')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                view === 'tasks'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Tasks {totalTasks > 0 && `(${completedCount}/${totalTasks})`}
            </button>
          </div>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl">
          {view === 'artifacts'
            ? 'All formal documents, plans, and memos produced by the council.'
            : 'Action items extracted from your artifacts. Check them off as you complete them.'}
        </p>
      </div>

      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-zinc-400">Loading...</div>
          </div>
        ) : view === 'artifacts' ? (
          artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">No artifacts yet</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm max-w-md">
                Start chatting with your council members. When they generate structured outputs like Decision Memos or Execution Plans, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <ArtifactGrid artifacts={artifacts} onSelect={handleSelect} />
          )
        ) : (
          // Tasks view
          tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">No tasks yet</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm max-w-md">
                Tasks are extracted from artifacts. Create Decision Memos, Execution Plans, or PRDs to see action items here.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-8 max-w-3xl mx-auto">
              {Object.entries(tasksByArtifact).map(([artifactId, group]) => {
                const role = ROLES[group.role_slug];
                return (
                  <div key={artifactId} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <div className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 ${role?.bgLight || 'bg-zinc-50 dark:bg-zinc-800'}`}>
                      <div className={`h-2 w-2 rounded-full ${role?.bgDark || 'bg-zinc-400'}`} />
                      <span className={`text-sm font-semibold ${role?.text || 'text-zinc-700 dark:text-zinc-300'}`}>
                        {group.title}
                      </span>
                      <span className="text-xs text-zinc-400 ml-auto">
                        {group.tasks.filter(t => completedTasks.has(t.id)).length}/{group.tasks.length}
                      </span>
                    </div>
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {group.tasks.map(task => {
                        const isCompleted = completedTasks.has(task.id);
                        return (
                          <label
                            key={task.id}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() => toggleTask(task.id)}
                              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${isCompleted ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {task.text}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )
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
