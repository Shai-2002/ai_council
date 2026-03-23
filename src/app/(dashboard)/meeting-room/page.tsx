"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { onCreateChat, onDeleteChat } from "@/lib/placeholder";
import { useRouter } from "next/navigation";
import { Users, Plus, MessageSquare, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SidebarChat {
  id: string;
  title: string;
  updated_at: string;
}

export default function MeetingRoomIndexPage() {
  const router = useRouter();
  const { workspaceId } = useWorkspace();
  const [meetingRooms, setMeetingRooms] = useState<SidebarChat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!workspaceId) return;
      try {
        const res = await fetch(`/api/chats?workspaceId=${workspaceId}`);
        if (res.ok) {
          const allChats = await res.json();
          const meetings = allChats.filter((c: { project_id?: string; chat_type?: string; id: string; title?: string; updated_at: string }) => !c.project_id && c.chat_type === 'meeting_room');
          setMeetingRooms(meetings.map((m: { id: string; title?: string; updated_at: string }) => ({
            id: m.id,
            title: m.title || "Meeting Room",
            updated_at: m.updated_at
          })));
        }
      } catch (e) {
        console.error("Failed to load meetings", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [workspaceId]);

  const handleCreateMeetingRoom = async () => {
    const chat = await onCreateChat({ title: "New Meeting Room", chatType: "meeting_room" });
    router.push(`/meeting-room/${chat.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    await onDeleteChat(id);
    setMeetingRooms(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl shrink-0">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Meeting Room</h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">
              Collaborate dynamically with all your AI executives in one shared space. Tag specific roles or request wide counsel.
            </p>
          </div>
          <Button onClick={handleCreateMeetingRoom} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0 shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Meeting Room
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-zinc-500">Loading rooms...</div>
        ) : (
          <div className="space-y-4">
            {meetingRooms.length > 0 ? meetingRooms.map(room => (
              <Link 
                key={room.id} 
                href={`/meeting-room/${room.id}`}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all"
              >
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 shrink-0 self-start sm:self-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                    {room.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(room.updated_at).toLocaleDateString()}
                    </span>
                    <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="truncate">Independent cross-council session</span>
                  </div>
                </div>
                
                <div className="hidden sm:flex shrink-0 items-center justify-end">
                   <button
                     onClick={(e) => handleDelete(e, room.id)}
                     className="p-2 sm:mr-4 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </Link>
            )) : (
              <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No meeting rooms found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">Start a cross-council multi-role session to brainstorm and coordinate seamlessly.</p>
                <Button onClick={handleCreateMeetingRoom} variant="outline" className="mt-6 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  Start a Meeting
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
