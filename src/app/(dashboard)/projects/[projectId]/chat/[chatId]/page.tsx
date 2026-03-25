"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoles } from "@/lib/hooks/useRoles";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { SidePanel } from "@/components/panel/SidePanel";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectChatPage() {
  const { rolesMap } = useRoles();
  const { projectId, chatId } = useParams();
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const projectIdStr = typeof projectId === 'string' ? projectId : '';
  const chatIdStr = typeof chatId === 'string' ? chatId : '';

  const [chat, setChat] = useState<{ id: string; title: string; role_slug: string } | null>(null);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [chatRes, projRes] = await Promise.all([
          fetch(`/api/chats/${chatIdStr}`),
          fetch(`/api/projects/${projectIdStr}`),
        ]);
        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setChat({ id: chatData.id, title: chatData.title, role_slug: chatData.role_slug });
        }
        if (projRes.ok) {
          const projData = await projRes.json();
          setProjectName(projData.name);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [chatIdStr, projectIdStr]);

  if (loading) return <div className="flex-1 flex items-center justify-center h-full text-zinc-400">Loading...</div>;
  if (!chat) return <div className="p-8">Chat not found</div>;

  const role = rolesMap[chat.role_slug];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <div className="shrink-0 h-14 border-b flex items-center px-4 md:px-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 md:hidden" onClick={() => router.push(`/projects/${projectIdStr}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 overflow-hidden hidden sm:flex">
            <Link href="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0">Projects</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={`/projects/${projectIdStr}`} className="hover:text-zinc-900 dark:hover:text-zinc-100 truncate max-w-[150px]">{projectName}</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <div className={`h-2 w-2 rounded-full ${role?.bgDark || 'bg-zinc-500'}`} />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{chat.title}</span>
            <span className="text-zinc-400 px-1">•</span>
            <span className="text-sm font-medium text-zinc-500">{role?.name || chat.role_slug}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative flex">
        <div className="flex-1 min-w-0 h-full relative">
          {role ? (
            <ChatInterface role={role} workspaceId={workspaceId} chatId={chatIdStr} projectId={projectIdStr} />
          ) : (
            <div className="p-8">Role configuration not found.</div>
          )}
        </div>
        <SidePanel 
          workspaceId={workspaceId || "default"}
          chatId={chatIdStr}
          projectId={projectIdStr}
          mode="single"
          currentRoleSlug={role?.slug}
        />
      </div>
    </div>
  );
}
