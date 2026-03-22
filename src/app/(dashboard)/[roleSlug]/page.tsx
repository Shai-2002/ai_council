"use client";

import { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { ROLES } from "@/lib/roles-config";
import { RoleHeader } from "@/components/roles/RoleHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useWorkspace } from "@/lib/hooks/useWorkspace";

export default function RoleChatPage() {
  const params = useParams();
  const roleSlug = params.roleSlug as string;
  const role = ROLES[roleSlug];
  const { workspaceId, loading } = useWorkspace();
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId || !role) { setChatLoading(false); return; }

    async function loadOrCreateChat() {
      try {
        // Try to find the most recent chat for this role
        const res = await fetch(`/api/chats?workspaceId=${workspaceId}&roleSlug=${role.slug}`);
        if (res.ok) {
          const chats = await res.json();
          // Filter to non-project chats only
          const independentChats = chats.filter((c: { project_id: string | null }) => !c.project_id);
          if (independentChats.length > 0) {
            setChatId(independentChats[0].id);
          } else {
            // Create a new chat for this role
            const createRes = await fetch('/api/chats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                workspaceId,
                title: `Chat with ${role.name} (${role.title})`,
                roleSlug: role.slug,
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
