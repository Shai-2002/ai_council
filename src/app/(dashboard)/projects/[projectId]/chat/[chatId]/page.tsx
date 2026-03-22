"use client";

import { useParams, useRouter } from "next/navigation";
import { MOCK_PROJECTS } from "@/lib/mock-sidebar-data";
import { ROLES } from "@/lib/roles-config";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectChatPage() {
  const { projectId, chatId } = useParams();
  const router = useRouter();
  
  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  const chat = project?.chats?.find(c => c.id === chatId);
  
  if (!project || !chat) {
    return <div className="p-8">Chat not found</div>;
  }

  const role = ROLES[chat.roleSlug];

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      {/* Project Chat Header */}
      <div className="shrink-0 h-14 border-b flex items-center px-4 md:px-6 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 md:hidden" onClick={() => router.push(`/projects/${project.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 overflow-hidden hidden sm:flex">
            <Link href="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0">Projects</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={`/projects/${project.id}`} className="hover:text-zinc-900 dark:hover:text-zinc-100 truncate max-w-[150px]">{project.name}</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </div>

          <div className="flex items-center gap-2 ml-1">
            <div className={`h-2 w-2 rounded-full ${role?.bgDark || 'bg-zinc-500'}`} />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">{chat.title}</span>
            <span className="text-zinc-400 px-1">•</span>
            <span className="text-sm font-medium text-zinc-500">{role?.name || chat.roleSlug}</span>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      {role ? (
        <ChatInterface role={role} workspaceId={project.id} />
      ) : (
        <div className="p-8">Role configuration not found for slug `{chat.roleSlug}`.</div>
      )}
    </div>
  );
}
