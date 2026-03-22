"use client";

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

  if (!role) {
    notFound();
  }

  if (loading) {
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
    <div className="flex flex-col h-full w-full">
      <RoleHeader role={role} />
      <div className="flex-1 overflow-hidden relative">
        <ChatInterface
          key={`${roleSlug}-${workspaceId}`}
          role={role}
          workspaceId={workspaceId}
        />
      </div>
    </div>
  );
}
