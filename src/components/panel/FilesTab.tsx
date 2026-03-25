"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, FileImage, FileSpreadsheet, File, CheckCircle2, Loader2, AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  id: string;
  name: string;
  sizeBytes: number;
  status: 'done' | 'processing' | 'failed';
  type: string;
  scope: 'chat' | 'project' | 'workspace';
}

interface FilesTabProps {
  workspaceId: string;
  chatId?: string;
  projectId?: string;
}

export function FilesTab({ workspaceId, chatId, projectId }: FilesTabProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated fetch
  useEffect(() => {
    let mounted = true;
    const loadFiles = async () => {
      setLoading(true);
      // Try to fetch, or fallback to mock
      try {
        const res = await fetch(`/api/files?workspaceId=${workspaceId}${chatId ? `&chatId=${chatId}` : ''}${projectId ? `&projectId=${projectId}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setFiles(data);
        } else {
          throw new Error('Fallback to mock');
        }
      } catch {
        if (!mounted) return;
        // Mock data
        setFiles([
          { id: '1', name: 'market_research.pdf', sizeBytes: 1200000, status: 'done', type: 'application/pdf', scope: 'chat' },
          { id: '2', name: 'financials_q3.xlsx', sizeBytes: 450000, status: 'processing', type: 'application/vnd.ms-excel', scope: 'project' },
          { id: '3', name: 'user_interviews.docx', sizeBytes: 2100000, status: 'failed', type: 'application/msword', scope: 'project' },
          { id: '4', name: 'company_branding.png', sizeBytes: 5000000, status: 'done', type: 'image/png', scope: 'workspace' },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFiles();
    return () => { mounted = false; };
  }, [workspaceId, chatId, projectId]);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = async (e) => {
      const selected = Array.from((e.target as HTMLInputElement).files || []);
      if (!selected.length) return;

      const newFiles = selected.map(f => ({
        id: Math.random().toString(),
        name: f.name,
        sizeBytes: f.size,
        status: 'processing' as const,
        type: f.type,
        scope: chatId ? 'chat' : projectId ? 'project' : 'workspace' as const
      }));

      setFiles(prev => [...newFiles, ...prev]);

      // Simulate extraction completing
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          newFiles.find(n => n.id === f.id) 
            ? { ...f, status: Math.random() > 0.8 ? 'failed' : 'done' } 
            : f
        ));
      }, 3000);
    };
    input.click();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-rose-500" />;
    if (type.includes('image')) return <FileImage className="h-4 w-4 text-emerald-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
    if (type.includes('word')) return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-zinc-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const groupFiles = (scope: 'chat' | 'project' | 'workspace') => files.filter(f => f.scope === scope);

  const renderFile = (f: FileItem) => (
    <div key={f.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 group transition-colors">
      <div className="mt-0.5 shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-md shadow-sm">
        {getFileIcon(f.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:underline">
          {f.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500">{formatSize(f.sizeBytes)}</span>
          <span className="text-zinc-300 dark:text-zinc-700">&middot;</span>
          {f.status === 'done' && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Extracted
            </span>
          )}
          {f.status === 'processing' && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Processing
            </span>
          )}
          {f.status === 'failed' && (
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" /> Failed
            </span>
          )}
        </div>
      </div>
      {f.status === 'failed' && (
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => console.log('Retry', f.id)}>
          <RefreshCw className="h-3 w-3 text-zinc-400" />
        </Button>
      )}
      {f.status !== 'failed' && (
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  const chatFiles = groupFiles('chat');
  const projectFiles = groupFiles('project');
  const workspaceFiles = groupFiles('workspace');

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Button onClick={handleUpload} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm" variant="outline">
          <Upload className="h-4 w-4 mr-2" /> Upload File
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="text-center py-8 text-zinc-500 text-sm">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-sm">No files uploaded yet.</div>
        ) : (
          <>
            {chatFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">This Chat</h4>
                <div className="space-y-1">{chatFiles.map(renderFile)}</div>
              </div>
            )}
            
            {projectFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">Project</h4>
                <div className="space-y-1">{projectFiles.map(renderFile)}</div>
              </div>
            )}

            {workspaceFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">Workspace</h4>
                <div className="space-y-1">{workspaceFiles.map(renderFile)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
