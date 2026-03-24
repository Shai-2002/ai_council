"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { useRoles } from "@/lib/hooks/useRoles";
import { Folder, ChevronRight, MessageSquare, Plus, FileText, Settings, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePool } from "@/components/files/FilePool";
import { MeetingRoomChat } from "@/components/meeting/MeetingRoomChat";
import { ProjectHealthCard } from "@/components/projects/ProjectHealthCard";
import { onCreateChat } from "@/lib/placeholder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  chats: Array<{ id: string; title: string; role_slug: string; updated_at: string }>;
  files: Array<{ id: string; name: string }>;
}

export default function ProjectDetail() {
  const { rolesMap } = useRoles();
  const { projectId } = useParams();
  const router = useRouter();
  // workspaceId used below for meeting room
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chats");
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [meetingChatId, setMeetingChatId] = useState<string | null>(null);
  const { workspaceId } = useWorkspace();

  useEffect(() => {
    if (!projectId) return;
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) setProject(await res.json());
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [projectId]);

  // Find or create a meeting room for this project
  useEffect(() => {
    if (!workspaceId || !projectId || !project) return;
    async function loadMeetingRoom() {
      try {
        const res = await fetch(`/api/chats?workspaceId=${workspaceId}&projectId=${projectId}&type=meeting_room`);
        if (res.ok) {
          const chats = await res.json();
          if (chats.length > 0) {
            setMeetingChatId(chats[0].id);
          }
          // Don't auto-create — only create when user opens the tab
        }
      } catch { /* ignore */ }
    }
    loadMeetingRoom();
  }, [workspaceId, projectId, project]);

  const ensureMeetingRoom = async () => {
    if (meetingChatId) return meetingChatId;
    if (!workspaceId || !projectId) return null;
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          title: `${project?.name || 'Project'} Meeting Room`,
          projectId,
          chatType: 'meeting_room',
        }),
      });
      if (res.ok) {
        const chat = await res.json();
        setMeetingChatId(chat.id);
        return chat.id;
      }
    } catch { /* ignore */ }
    return null;
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-full text-zinc-400">Loading project...</div>;
  }

  if (!project) {
    return <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">Project not found.</div>;
  }

  const handleCreateChat = async () => {
    const chat = await onCreateChat({ title: "New Project Chat", projectId: project.id, roleSlug: "ceo" });
    router.push(`/projects/${project.id}/chat/${chat.id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 mb-6">
          <Link href="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Projects</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-900 dark:text-zinc-100">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg shrink-0">
                <Folder className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {project.name}
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              {project.description || "No description provided."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0">
                <Settings className="h-4 w-4" /> Manage
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setNewName(project.name); setIsRenaming(true); }}>
                  <Pencil className="h-4 w-4 mr-2" /> Rename project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                  onClick={async () => {
                    if (confirm('Delete this project and all its chats?')) {
                      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
                      router.push('/projects');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rename dialog inline */}
          {isRenaming && (
            <div className="flex items-center gap-2 mt-4 w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    await fetch(`/api/projects/${projectId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName.trim() }),
                    });
                    setProject(prev => prev ? { ...prev, name: newName.trim() } : prev);
                    setIsRenaming(false);
                  }
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
              />
              <Button
                size="sm"
                onClick={async () => {
                  if (newName.trim()) {
                    await fetch(`/api/projects/${projectId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: newName.trim() }),
                    });
                    setProject(prev => prev ? { ...prev, name: newName.trim() } : prev);
                    setIsRenaming(false);
                  }
                }}
              >
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsRenaming(false)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Project Health */}
        <div className="mt-8">
          <ProjectHealthCard />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); if (val === 'meeting-room') ensureMeetingRoom(); }} className="mt-8">
          <TabsList className="bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-xl h-12 w-full sm:w-auto inline-flex mb-6">
            <TabsTrigger value="chats" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm text-sm">
              <MessageSquare className="h-4 w-4 mr-2" /> Chats
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm text-sm">
              <FileText className="h-4 w-4 mr-2" /> Files
            </TabsTrigger>
            <TabsTrigger value="meeting-room" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm text-sm">
              <MessageSquare className="h-4 w-4 mr-2" /> Meeting Room
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="outline-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-zinc-100">Active Discussions</h3>
              <Button size="sm" onClick={handleCreateChat}>
                <Plus className="h-4 w-4 mr-1.5" /> New Chat
              </Button>
            </div>

            <div className="grid gap-3">
              {project.chats && project.chats.length > 0 ? project.chats.map(chat => {
                const role = rolesMap[chat.role_slug];
                return (
                  <Link
                    key={chat.id}
                    href={`/projects/${project.id}/chat/${chat.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                  >
                    <div className={`p-2.5 rounded-lg ${role?.bgDark || 'bg-zinc-500'} text-white shrink-0`}>
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {chat.title}
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        With {role?.name || chat.role_slug}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              }) : (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                  <p className="text-zinc-500">No chats yet. Start a discussion with the Council.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="outline-none">
            <div className="mb-4">
              <h3 className="text-lg font-semibold dark:text-zinc-100">Project Knowledge Base</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Files here are accessible by all roles working on this project.</p>
            </div>
            <FilePool context={{ projectId: project.id }} />
          </TabsContent>

          <TabsContent value="meeting-room" className="outline-none h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mt-4 bg-white dark:bg-zinc-950">
            {meetingChatId ? (
              <MeetingRoomChat chatId={meetingChatId} workspaceId={workspaceId || "default"} projectId={project.id} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-zinc-500 mb-4">No meeting room for this project yet.</p>
                <Button onClick={ensureMeetingRoom} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" /> Create Meeting Room
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
