import { MOCK_PROJECTS } from "@/lib/mock-sidebar-data";
import { Folder, Clock, FileText, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectsPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Projects</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              Manage your organized workspaces, files, and targeted chats.
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map(project => (
            <Link 
              key={project.id} 
              href={`/projects/${project.id}`}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group flex flex-col h-[220px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <Folder className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {project.name}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
                {project.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
                <div className="flex items-center gap-1.5" title="Chats">
                  <MessageSquare className="h-4 w-4" /> {project.chats?.length || 0}
                </div>
                <div className="flex items-center gap-1.5" title="Files">
                  <FileText className="h-4 w-4" /> {project.filesCount || 0}
                </div>
                <div className="flex items-center gap-1.5 ml-auto text-zinc-400 dark:text-zinc-500 font-normal">
                  <Clock className="h-3.5 w-3.5" /> 
                  {new Date(project.updatedAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
