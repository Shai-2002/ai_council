"use client";

import { useParams, useRouter } from "next/navigation";
import { MOCK_CHAT_HISTORY } from "@/lib/mock-sidebar-data";
import { ROLES } from "@/lib/roles-config";
import type { RoleSlug } from "@/types";
import { MessageSquare, Plus, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { onCreateChat } from "@/lib/placeholder";

export default function RoleHistoryPage() {
  const { roleSlug } = useParams();
  const router = useRouter();
  
  const roleStr = typeof roleSlug === 'string' ? roleSlug : Array.isArray(roleSlug) ? roleSlug[0] : '';
  const role = ROLES[roleStr as RoleSlug];
  
  if (!role) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">
        Role not found.
      </div>
    );
  }

  const chats = MOCK_CHAT_HISTORY[role.slug] || [];

  const handleCreateChat = async () => {
    const chat = await onCreateChat({ title: "New Chat", roleSlug: role.slug });
    router.push(`/${role.slug}/chat/${chat.id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              <span className={`h-2 w-2 rounded-full ${role.bgDark}`} />
              {role.name} • {role.title}
            </div>
            <h1 className={`text-3xl font-bold tracking-tight ${role.text}`}>Chat History</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Past conversations and strategies with the {role.title}.
            </p>
          </div>
          <Button onClick={handleCreateChat} className={`${role.bgDark} text-white hover:opacity-90 transition-opacity border-0`}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {chats.length > 0 ? chats.map(chat => (
            <Link 
              key={chat.id} 
              href={`/${role.slug}/chat/${chat.id}`}
              className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
            >
              <div className={`p-3 rounded-xl ${role.bgLight} shrink-0 self-start sm:self-center`}>
                <MessageSquare className={`h-6 w-6 ${role.text}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                  {chat.title}
                </h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="truncate">Independent session (Not in a project)</span>
                  </div>
              </div>
              
              <div className="hidden sm:flex shrink-0">
                <ChevronRight className={`h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:${role.text} transition-colors translate-x-0 group-hover:translate-x-1`} />
              </div>
            </Link>
          )) : (
            <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className={`mx-auto w-12 h-12 rounded-full ${role.bgLight} flex items-center justify-center mb-4`}>
                <MessageSquare className={`h-6 w-6 ${role.text}`} />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No chats found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">You haven&apos;t started any independent conversations with the {role.title} yet.</p>
              <Button onClick={handleCreateChat} variant="outline" className={`mt-6 ${role.text} border-${role.color}-200 dark:border-${role.color}-800 hover:bg-${role.color}-50 dark:hover:bg-${role.color}-900/20`}>
                Start a conversation
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
