"use client";

import { notFound, useParams } from "next/navigation";
import { ROLES } from "@/lib/roles-config";
import { RoleHeader } from "@/components/roles/RoleHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types";
import type { RoleSlug } from "@/types";

export default function RoleChatPage() {
  const params = useParams();
  const roleSlug = params.roleSlug as string;
  const role = ROLES[roleSlug];
  const { workspaceId } = useWorkspace();
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setLoaded(true);
      return;
    }

    async function fetchMessages() {
      const supabase = createClient();
      const { data } = await supabase
        .from('messages')
        .select('id, sender, content, created_at')
        .eq('workspace_id', workspaceId)
        .eq('role_slug', roleSlug)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        setInitialMessages(
          data.map((m) => ({
            id: m.id,
            role: m.sender as 'user' | 'assistant',
            content: m.content,
          }))
        );
      }
      setLoaded(true);
    }

    fetchMessages();
  }, [workspaceId, roleSlug]);

  if (!role) {
    notFound();
  }

  if (!loaded) {
    return (
      <div className="flex flex-col h-full w-full">
        <RoleHeader role={role} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-zinc-400">Loading conversation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <RoleHeader role={role} />
      <div className="flex-1 overflow-hidden relative">
        <ChatInterface
          key={`${roleSlug}-${workspaceId}`}
          role={role}
          workspaceId={workspaceId}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  );
}
