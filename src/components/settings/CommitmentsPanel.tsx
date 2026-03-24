"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

export interface Commitment {
  id: string;
  command: string;
  type: "policy" | "constraint" | "definition";
  scope: "workspace" | { projectId: string };
  createdAt: string;
}

// No mock data — fetches from real API

export function CommitmentsPanel({ workspaceId }: { workspaceId?: string | null }) {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }
    
    async function load() {
      try {
        const res = await fetch(`/api/commitments?workspaceId=${workspaceId}`);
        if (res.ok) {
          const data = await res.json();
          setCommitments(Array.isArray(data) ? data : []);
        } else {
          setCommitments([]);
        }
      } catch {
        setCommitments([]);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [workspaceId]);

  const removeCommitment = async (id: string) => {
    setCommitments(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/commitments/${id}`, { method: 'DELETE' });
    } catch {
      // Mock failure allowed
    }
  };

  if (loading) {
    return <div className="text-sm text-zinc-500">Loading rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Active Rules ({commitments.length})</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Rules are automatically extracted instructions that constrain AI behavior.</p>
      </div>

      <div className="grid gap-3 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
        {commitments.length === 0 ? (
          <div className="p-8 text-center text-sm text-zinc-500">No active rules.</div>
        ) : (
          commitments.map((rule, idx) => {
            const isLast = idx === commitments.length - 1;
            const scopeText = rule.scope === 'workspace' ? 'Entire workspace' : 'Project-scoped';
            const dateStr = new Date(rule.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            
            return (
              <div key={rule.id} className={`p-4 flex items-start gap-4 ${!isLast ? 'border-b border-zinc-200 dark:border-zinc-800' : ''}`}>
                <div className="flex flex-col gap-2 items-start flex-1 min-w-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {rule.type}
                  </span>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">&quot;{rule.command}&quot;</p>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                    <span>Scope: {scopeText}</span>
                    <span>&middot;</span>
                    <span>Created: {dateStr}</span>
                  </div>
                </div>
                <button
                  title="Remove Rule"
                  onClick={() => removeCommitment(rule.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
