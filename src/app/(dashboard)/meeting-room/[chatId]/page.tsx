"use client";

import { useParams, useRouter } from "next/navigation";
import { MeetingRoomChat } from "@/components/meeting/MeetingRoomChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { SidePanel } from "@/components/panel/SidePanel";
import { useEffect, useState } from "react";

export default function MeetingRoomInstancePage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { workspaceId } = useWorkspace();
  const [chatTitle, setChatTitle] = useState("Meeting Room Context");

  useEffect(() => {
    // Optionally fetch chat explicitly to verify bounds or get title
    async function getTitle() {
      try {
        const res = await fetch(`/api/chats/${chatId}`);
        if (res.ok) {
           const data = await res.json();
           if (data.title) setChatTitle(data.title);
        }
      } catch { /* ignore */ }
    }
    getTitle();
  }, [chatId]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      {/* Dynamic Header */}
      <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="h-14 flex items-center px-4 md:px-6 justify-between gap-4 w-full">
          <div className="flex items-center gap-3 overflow-hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-1 shrink-0" onClick={() => router.push(`/meeting-room`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-md shrink-0 hidden sm:flex">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
               {chatTitle}
            </div>
          </div>
          
          <div className="hidden sm:block shrink-0">
             <Link href={`/meeting-room`} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
               View all meetings
             </Link>
          </div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 min-w-0 h-full">
          <MeetingRoomChat chatId={chatId as string} workspaceId={workspaceId || "default"} />
        </div>
        <SidePanel 
          workspaceId={workspaceId || "default"}
          chatId={chatId as string}
          mode="meeting"
        />
      </div>
    </div>
  );
}
