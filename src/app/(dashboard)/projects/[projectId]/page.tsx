"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_PROJECTS } from "@/lib/mock-sidebar-data";
import { ROLES } from "@/lib/roles-config";
import { Folder, ChevronRight, MessageSquare, Plus, FileText, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePool } from "@/components/files/FilePool";
import { onCreateChat } from "@/lib/placeholder";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const router = useRouter();
  const project = MOCK_PROJECTS.find(p => p.id === projectId);
  
  const [activeTab, setActiveTab] = useState("chats");

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">
        Project not found.
      </div>
    );
  }

  const handleCreateChat = async () => {
    // For demo, default to CEO when creating from project root
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
            <Button variant="outline" className="shrink-0 bg-transparent">
              <Settings className="h-4 w-4 mr-2" /> Manage
            </Button>
          </div>
        </div>

        {/* Workspace Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-xl h-12 w-full sm:w-auto inline-flex mb-6">
            <TabsTrigger value="chats" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm text-sm">
              <MessageSquare className="h-4 w-4 mr-2" /> Chats
            </TabsTrigger>
            <TabsTrigger value="files" className="rounded-lg px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm text-sm">
              <FileText className="h-4 w-4 mr-2" /> Files
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
              {project.chats.length > 0 ? project.chats.map(chat => {
                const role = ROLES[chat.roleSlug];
                return (
                  <Link 
                    key={chat.id} 
                    href={`/projects/${project.id}/chat/${chat.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
                  >
                    <div className={`p-2.5 rounded-lg ${role?.bgDark} text-white shrink-0`}>
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {chat.title}
                      </h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                        With {role?.name || chat.roleSlug} • Last active recent
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
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
        </Tabs>

      </div>
    </div>
  );
}
