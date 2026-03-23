"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Folder, X } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

export function MoveToProjectDialog({
  chatId,
  open,
  onOpenChange,
  onMoved,
}: {
  chatId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMoved: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open]);

  const moveChat = async (projectId: string | null) => {
    await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId }),
    });
    onMoved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Move chat to project</DialogTitle>
        </DialogHeader>
        <div className="space-y-1 mt-2 max-h-64 overflow-y-auto">
          <button
            onClick={() => moveChat(null)}
            className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
          >
            <X className="h-4 w-4 text-zinc-400" />
            <span>No project (independent)</span>
          </button>
          {loading && (
            <p className="text-xs text-zinc-400 px-3 py-2">Loading projects...</p>
          )}
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => moveChat(p.id)}
              className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm transition-colors"
            >
              <Folder className="h-4 w-4 text-indigo-500" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
