"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoles } from "@/lib/hooks/useRoles";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default function RoleIndependentChatPage() {
  const { roleSlug, chatId } = useParams();
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const { getRoleBySlug } = useRoles();
  const roleStr = typeof roleSlug === 'string' ? roleSlug : Array.isArray(roleSlug) ? roleSlug[0] : '';
  const chatIdStr = typeof chatId === 'string' ? chatId : Array.isArray(chatId) ? chatId[0] : '';
  const role = getRoleBySlug(roleStr);

  const [chat, setChat] = useState<{ id: string; title: string; updated_at: string } | null>(null);
  const [initialMessages, setInitialMessages] = useState<Array<{ id: string; role: string; parts: Array<{ type: string; text: string }> }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatIdStr) return;
    async function load() {
      try {
        const res = await fetch(`/api/chats/${chatIdStr}`);
        if (res.ok) {
          const data = await res.json();
          setChat({ id: data.id, title: data.title, updated_at: data.updated_at });
          if (data.messages && data.messages.length > 0) {
            setInitialMessages(data.messages.map((m: { id: string; sender: string; content: string }) => ({
              id: m.id,
              role: m.sender,
              parts: [{ type: 'text', text: m.content }],
            })));
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [chatIdStr]);

  if (!role) return <div className="p-8">Role not found</div>;
  if (loading) return <div className="flex-1 flex items-center justify-center h-full text-zinc-400">Loading chat...</div>;
  if (!chat) return <div className="p-8">Chat not found</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="h-14 flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-1" onClick={() => router.push(`/${role.slug}/history`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{chat.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${role.bgLight} ${role.text}`}>
                  {role.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <Clock className="h-3 w-3" />
                <span>Last active: {new Date(chat.updated_at).toLocaleDateString()}</span>
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatInterface role={role} workspaceId={workspaceId} chatId={chatIdStr} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
