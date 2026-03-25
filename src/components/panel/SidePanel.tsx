"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, PanelRightOpen, Files, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilesTab } from "./FilesTab";
import { ModelsTab } from "./ModelsTab";

interface SidePanelProps {
  chatId?: string;
  projectId?: string;
  workspaceId: string;
  mode: 'single' | 'meeting' | 'direct';
  currentRoleSlug?: string;
}

export function SidePanel({ chatId, projectId, workspaceId, mode, currentRoleSlug }: SidePanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("files");

  useEffect(() => {
    const stored = localStorage.getItem("ai_council_sidepanel");
    if (stored !== null) {
      setIsOpen(stored === "true");
    }
  }, []);

  const togglePanel = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem("ai_council_sidepanel", String(next));
  };

  return (
    <>
      {/* Toggle Button for when closed */}
      {!isOpen && (
        <div className="absolute right-4 top-4 z-10 md:static md:p-4 md:pt-6 md:pr-4 md:bg-transparent">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePanel}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 shadow-sm md:border-transparent md:shadow-none md:bg-transparent"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Panel container */}
      <div 
        className={`fixed inset-y-0 right-0 z-40 md:relative transition-all duration-300 ease-in-out transform bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl md:shadow-none ${
          isOpen ? 'w-[85vw] sm:w-[320px] translate-x-0' : 'w-0 translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none'
        }`}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Controls</span>
              <Button variant="ghost" size="icon" onClick={togglePanel} className="h-8 w-8 text-zinc-500">
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-lg">
                  <TabsTrigger value="files" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm">
                    <Files className="h-3.5 w-3.5 mr-2" /> Files
                  </TabsTrigger>
                  <TabsTrigger value="models" className="text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 mr-2" /> Models
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="files" className="h-full m-0 outline-none border-none">
                  <FilesTab workspaceId={workspaceId} chatId={chatId} projectId={projectId} />
                </TabsContent>
                <TabsContent value="models" className="h-full m-0 outline-none border-none">
                  <ModelsTab mode={mode} currentRoleSlug={currentRoleSlug} workspaceId={workspaceId} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={togglePanel}
        />
      )}
    </>
  );
}
