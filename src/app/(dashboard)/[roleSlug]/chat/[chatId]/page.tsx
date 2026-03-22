"use client";

import { useParams, useRouter } from "next/navigation";
import { MOCK_CHAT_HISTORY } from "@/lib/mock-sidebar-data";
import { ROLES } from "@/lib/roles-config";
import type { RoleSlug } from "@/types";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default function RoleIndependentChatPage() {
  const { roleSlug, chatId } = useParams();
  const router = useRouter();
  
  const roleStr = typeof roleSlug === 'string' ? roleSlug : Array.isArray(roleSlug) ? roleSlug[0] : '';
  const role = ROLES[roleStr as RoleSlug];
  
  if (!role) {
    return <div className="p-8">Role not found</div>;
  }

  const chats = MOCK_CHAT_HISTORY[role.slug] || [];
  const chat = chats.find(c => c.id === chatId);

  if (!chat) {
    return <div className="p-8">Chat not found in history</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      {/* Dynamic Header replacement */}
      <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="h-14 flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 hidden sm:flex" onClick={() => router.push(`/${role.slug}/history`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 sm:hidden" onClick={() => router.push(`/${role.slug}/history`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-zinc-900 dark:text-zinc-100`}>{chat.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${role.bgLight} ${role.text}`}>
                  {role.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <Clock className="h-3 w-3" />
                <span>Last active: {new Date(chat.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:block">
             <Link href={`/${role.slug}/history`} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
               View all history
             </Link>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <ChatInterface role={role} workspaceId={`history-${chat.id}`} />
    </div>
  );
}
