"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { useRoles } from "@/lib/hooks/useRoles";
import { RoleHeader } from "@/components/roles/RoleHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useWorkspace } from "@/lib/hooks/useWorkspace";

export default function RoleChatPage() {
  const params = useParams();
  const roleSlug = params.roleSlug as string;
  const { getRoleBySlug } = useRoles();
  const role = getRoleBySlug(roleSlug);
  const { workspaceId, loading } = useWorkspace();
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId || !role) { setChatLoading(false); return; }
    const r = role; // narrow for closure

    async function loadOrCreateChat() {
      try {
        const res = await fetch(`/api/chats?workspaceId=${workspaceId}&roleSlug=${r.slug}`);
        if (res.ok) {
          const chats = await res.json();
          const independentChats = chats.filter((c: { project_id: string | null }) => !c.project_id);
          if (independentChats.length > 0) {
            setChatId(independentChats[0].id);
          } else {
            const createRes = await fetch('/api/chats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workspaceId,
                title: `Chat with ${r.name} (${r.title})`,
                roleSlug: r.slug,
                chatType: 'single',
              }),
            });
            if (createRes.ok) {
              const newChat = await createRes.json();
              setChatId(newChat.id);
            }
          }
        }
      } catch { /* ignore */ }
      setChatLoading(false);
    }

    loadOrCreateChat();
  }, [workspaceId, role]);

  if (!role) {
    notFound();
  }

  if (loading || chatLoading) {
    return (
      <div className="flex flex-col h-full w-full">
        <RoleHeader role={role} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="shrink-0">
        <RoleHeader role={role} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <ChatInterface
          key={`${roleSlug}-${workspaceId}-${chatId}`}
          role={role}
          workspaceId={workspaceId}
          chatId={chatId ?? undefined}
        />
      </div>
    </div>
  );
}
