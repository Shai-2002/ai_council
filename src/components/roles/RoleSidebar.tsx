"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layers, FileText, ChevronDown, ChevronRight, Folder, FolderInput, MessageSquare, Plus, Trash2, Users } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useRoles } from "@/lib/hooks/useRoles";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { onDeleteProject, onDeleteChat, onCreateChat } from "@/lib/placeholder";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { UserMenu } from "@/components/shared/UserMenu";
import { MoveToProjectDialog } from "@/components/shared/MoveToProjectDialog";
import { Separator } from "@/components/ui/separator";

function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return <Layers className={className} />;
  return <Icon className={className} />;
}

interface SidebarProject {
  id: string;
  name: string;
  description: string;
  chats: Array<{ id: string; title: string; role_slug: string }>;
}

interface SidebarChat {
  id: string;
  title: string;
  updated_at: string;
}

export function RoleSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { roles, rolesMap } = useRoles();
  const pathname = usePathname();
  const router = useRouter();
  const { workspaceId } = useWorkspace();

  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string[]>([]);
  const [isMeetingRoomExpanded, setIsMeetingRoomExpanded] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [chatHistory, setChatHistory] = useState<Record<string, SidebarChat[]>>({});
  const [meetingRooms, setMeetingRooms] = useState<SidebarChat[]>([]);
  const [moveChatId, setMoveChatId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!workspaceId) return;

    // Fetch projects with their chats
    try {
      const projRes = await fetch(`/api/projects?workspaceId=${workspaceId}`);
      if (projRes.ok) {
        const projData = await projRes.json();
        // For each project, fetch its chats
        const enriched = await Promise.all(
          projData.map(async (p: { id: string; name: string; description: string }) => {
            const chatsRes = await fetch(`/api/chats?workspaceId=${workspaceId}&projectId=${p.id}`);
            const chats = chatsRes.ok ? await chatsRes.json() : [];
            return { ...p, chats: chats.map((c: { id: string; title: string; role_slug: string }) => ({ id: c.id, title: c.title, role_slug: c.role_slug })) };
          })
        );
        setProjects(enriched);
      }
    } catch { /* ignore */ }

    // Fetch chat history grouped by role
    try {
      const chatsRes = await fetch(`/api/chats?workspaceId=${workspaceId}`);
      if (chatsRes.ok) {
        const allChats = await chatsRes.json();
        const grouped: Record<string, SidebarChat[]> = {};
        const meetings: SidebarChat[] = [];
        for (const chat of allChats) {
          if (!chat.project_id) {
            if (chat.chat_type === 'meeting_room') {
              meetings.push({ id: chat.id, title: chat.title || 'Meeting Room', updated_at: chat.updated_at });
            } else if (chat.role_slug) {
              if (!grouped[chat.role_slug]) grouped[chat.role_slug] = [];
              grouped[chat.role_slug].push({ id: chat.id, title: chat.title, updated_at: chat.updated_at });
            }
          }
        }
        setChatHistory(grouped);
        setMeetingRooms(meetings);
      }
    } catch { /* ignore */ }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleHistory = (slug: string) => {
    setExpandedHistory(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  };

  const handleCreateChat = async (roleSlug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chat = await onCreateChat({ title: "New chat", roleSlug });
    loadData();
    router.push(`/${roleSlug}/chat/${chat.id}`);
    if (onNavigate) onNavigate();
  };

  const handleCreateMeetingRoom = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const chat = await onCreateChat({ title: "New Meeting Room", chatType: "meeting_room" });
    loadData();
    router.push(`/meeting-room/${chat.id}`);
    if (onNavigate) onNavigate();
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteProject(id);
    loadData();
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteChat(id);
    loadData();
  };

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Brand */}
      <div className="p-6">
        <Link href="/ceo" onClick={handleNavClick} className="flex items-center gap-2 font-semibold text-lg">
          <Layers className="h-6 w-6 text-indigo-600" />
          <span>AI Roles</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 overflow-y-auto space-y-6">
        <div className="space-y-1">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">The Council</p>
          {roles.map((role) => {
            const isActive = pathname === `/${role.slug}`;

            return (
              <Link
                key={role.slug}
                href={`/${role.slug}`}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                  isActive
                    ? `${role.bgLight} ${role.text} font-medium`
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className={`p-1.5 rounded-md ${isActive ? role.bgDark + " text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
                  <IconByName name={role.icon} className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{role.name}</span>
                    {isActive && <div className={`h-1.5 w-1.5 rounded-full ${role.bgDark}`} />}
                  </div>
                  <div className="text-xs opacity-80 font-normal truncate">{role.title}</div>
                </div>
                <div
                  onClick={(e) => handleCreateChat(role.slug, e)}
                  title="New chat"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* MEETING ROOM */}
        <div className="space-y-1 mt-6">
          <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer" onClick={() => setIsMeetingRoomExpanded(!isMeetingRoomExpanded)}>
            <div className="flex items-center gap-2">
              {isMeetingRoomExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />}
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Meeting Room
              </span>
            </div>
            <button
              onClick={handleCreateMeetingRoom}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
              title="New meeting room"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {isMeetingRoomExpanded && (
            <div className="pl-6 pr-2 space-y-0.5 pb-2">
              {meetingRooms.length === 0 && (
                <p className="px-2 text-xs text-zinc-400 dark:text-zinc-500">No rooms yet</p>
              )}
              {meetingRooms.map(room => {
                const isRoomActive = pathname === `/meeting-room/${room.id}`;
                return (
                  <div key={room.id} className="flex items-center justify-between group">
                    <Link
                      href={`/meeting-room/${room.id}`}
                      onClick={handleNavClick}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors truncate flex-1 ${
                        isRoomActive
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <Users className="h-3 w-3 shrink-0 opacity-70" />
                      <span className="truncate">{room.title}</span>
                    </Link>
                    <button
                      title="Delete room"
                      onClick={(e) => handleDeleteChat(room.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity px-1 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PROJECTS */}
        <div className="space-y-1 mt-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <Link href="/projects" onClick={handleNavClick} className="text-xs font-medium text-zinc-500 uppercase tracking-wider hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Projects
            </Link>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="New project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {projects.length === 0 && (
            <p className="px-2 text-xs text-zinc-400 dark:text-zinc-500">No projects yet</p>
          )}

          {projects.map(project => {
            const isExpanded = expandedProjects.includes(project.id);
            return (
              <div key={project.id} className="space-y-0.5">
                <div
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer group"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />}
                    <Folder className="h-4 w-4 shrink-0 text-indigo-500" />
                    <Link href={`/projects/${project.id}`} onClick={(e) => { e.stopPropagation(); handleNavClick(); }} className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-1">
                       {project.name}
                    </Link>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity ml-2 shrink-0"
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="pl-8 pr-2 space-y-0.5 pb-2">
                    {project.chats.map(chat => {
                      const role = rolesMap[chat.role_slug];
                      const isChatActive = pathname === `/projects/${project.id}/chat/${chat.id}`;
                      return (
                        <Link
                          href={`/projects/${project.id}/chat/${chat.id}`}
                          onClick={handleNavClick}
                          key={chat.id}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            isChatActive
                              ? `bg-zinc-100 dark:bg-zinc-800 ${role?.text || 'text-zinc-900 dark:text-zinc-100'} font-medium`
                              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                          <span className="truncate">{chat.title}</span>
                          {role && <span className={`h-1.5 w-1.5 rounded-full ${role.bgDark} shrink-0 ml-auto opacity-70`} />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CHAT HISTORY */}
        <div className="space-y-1 mt-6">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Chat History</p>

          {roles.map(role => {
            const chats = chatHistory[role.slug];
            if (!chats || chats.length === 0) return null;

            const isExpanded = expandedHistory.includes(role.slug);
            return (
              <div key={role.slug} className="space-y-0.5">
                <div
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  onClick={() => toggleHistory(role.slug)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />}
                  <Link href={`/${role.slug}/history`} onClick={(e) => { e.stopPropagation(); handleNavClick(); }} className={`text-sm font-medium ${role.text} truncate hover:underline`}>
                    {role.name} chats
                  </Link>
                </div>

                {isExpanded && (
                  <div className="pl-8 pr-2 space-y-0.5 pb-2">
                    {chats.map(chat => {
                      const isChatActive = pathname === `/${role.slug}/chat/${chat.id}`;
                      return (
                        <div key={chat.id} className="flex items-center justify-between group">
                          <Link
                            href={`/${role.slug}/chat/${chat.id}`}
                            onClick={handleNavClick}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors truncate flex-1 ${
                              isChatActive
                                ? `bg-zinc-100 dark:bg-zinc-800 ${role.text} font-medium`
                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
                            }`}
                          >
                            <MessageSquare className="h-3 w-3 shrink-0 opacity-70" />
                            <span className="truncate">{chat.title}</span>
                          </Link>
                          <button
                            title="Move to project"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMoveChatId(chat.id); }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-500 transition-opacity px-1 shrink-0"
                          >
                            <FolderInput className="h-3 w-3" />
                          </button>
                          <button
                            title="Delete chat"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity px-1 shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-1 mt-6">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Workspace</p>
          <Link
            href="/artifacts"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === "/artifacts"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <div className={`p-1.5 rounded-md ${pathname === "/artifacts" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-sm">Artifacts</span>
          </Link>
          <Link
            href="/pricing"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === "/pricing"
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <div className={`p-1.5 rounded-md ${pathname === "/pricing" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
              <IconByName name="BadgeIndianRupee" className="h-4 w-4" />
            </div>
            <span className="text-sm">Pricing</span>
          </Link>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <UserMenu />
      </div>

      <CreateProjectDialog
        open={isCreateProjectOpen}
        onOpenChange={(open) => {
          setIsCreateProjectOpen(open);
          if (!open) loadData();
        }}
      />

      {moveChatId && (
        <MoveToProjectDialog
          chatId={moveChatId}
          open={!!moveChatId}
          onOpenChange={(open) => { if (!open) setMoveChatId(null); }}
          onMoved={() => { setMoveChatId(null); loadData(); }}
        />
      )}
    </div>
  );
}
