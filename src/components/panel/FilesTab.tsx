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

  // Fetch real files from API
  useEffect(() => {
    let mounted = true;
    const loadFiles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ workspaceId });
        if (chatId) params.append('chatId', chatId);
        if (projectId) params.append('projectId', projectId);
        const res = await fetch(`/api/files?${params}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = (Array.isArray(data) ? data : []).map((f: Record<string, unknown>) => ({
            id: f.id as string,
            name: f.name as string,
            sizeBytes: (f.size_bytes || f.file_size || 0) as number,
            status: f.extraction_status === 'done' ? 'done' as const : f.extraction_status === 'failed' ? 'failed' as const : 'processing' as const,
            type: (f.file_type || 'application/octet-stream') as string,
            scope: (f.chat_id === chatId && chatId ? 'chat' : f.project_id === projectId && projectId ? 'project' : 'workspace') as 'chat' | 'project' | 'workspace',
          }));
          if (mounted) setFiles(mapped);
        } else {
          if (mounted) setFiles([]);
        }
      } catch {
        if (mounted) setFiles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFiles();
    return () => { mounted = false; };
  }, [workspaceId, chatId, projectId]);

  // Poll for processing files every 5 seconds
  useEffect(() => {
    const processingFiles = files.filter(f => f.status === 'processing');
    if (processingFiles.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const params = new URLSearchParams({ workspaceId });
        if (chatId) params.append('chatId', chatId);
        if (projectId) params.append('projectId', projectId);
        const res = await fetch(`/api/files?${params}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = (Array.isArray(data) ? data : []).map((f: Record<string, unknown>) => ({
            id: f.id as string,
            name: f.name as string,
            sizeBytes: (f.size_bytes || f.file_size || 0) as number,
            status: f.extraction_status === 'done' ? 'done' as const : f.extraction_status === 'failed' ? 'failed' as const : 'processing' as const,
            type: (f.file_type || 'application/octet-stream') as string,
            scope: (f.chat_id === chatId && chatId ? 'chat' : f.project_id === projectId && projectId ? 'project' : 'workspace') as 'chat' | 'project' | 'workspace',
          }));
          setFiles(mapped);
        }
      } catch { /* ignore polling errors */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [files, workspaceId, chatId, projectId]);

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.doc,.xlsx,.csv,.txt,.md,.json,.png,.jpg,.jpeg";

    input.onchange = async (e) => {
      const selected = Array.from((e.target as HTMLInputElement).files || []);
      if (!selected.length) return;

      for (const file of selected) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const scope: 'chat' | 'project' | 'workspace' = chatId ? 'chat' : projectId ? 'project' : 'workspace';

        // Show processing immediately
        setFiles(prev => [{ id: tempId, name: file.name, sizeBytes: file.size, status: 'processing', type: file.type, scope }, ...prev]);

        try {
          // Try signed URL upload (supports large files)
          const urlRes = await fetch('/api/files/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, fileType: file.type, workspaceId, chatId: chatId || null, projectId: projectId || null }),
          });

          if (urlRes.ok) {
            const { fileId, uploadUrl } = await urlRes.json();
            await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
            // Trigger extraction
            fetch(`/api/files/${fileId}/extract`, { method: 'POST' }).catch(() => {});
            // Replace temp entry with real ID
            setFiles(prev => prev.map(f => f.id === tempId ? { ...f, id: fileId } : f));
          } else {
            // Fallback to multipart upload for small files
            const formData = new FormData();
            formData.append('file', file);
            formData.append('workspaceId', workspaceId);
            if (chatId) formData.append('chatId', chatId);
            if (projectId) formData.append('projectId', projectId);
            const uploadRes = await fetch('/api/files/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            const first = Array.isArray(uploadData) ? uploadData[0] : uploadData;
            if (first?.id) {
              setFiles(prev => prev.map(f => f.id === tempId ? { ...f, id: first.id } : f));
            }
          }
        } catch (err) {
          console.error('Upload failed:', err);
          setFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed' } : f));
        }
      }
    };

    input.click();
  };

  const handleRetry = (fileId: string) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, status: 'processing' } : f));
    fetch(`/api/files/${fileId}/extract`, { method: 'POST' }).catch(console.error);
  };

  const handleDelete = async (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    try {
      await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
    } catch { /* ignore */ }
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
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
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
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRetry(f.id)}>
          <RefreshCw className="h-3 w-3 text-zinc-400" />
        </Button>
      )}
      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500" onClick={() => handleDelete(f.id)}>
        <X className="h-3 w-3" />
      </Button>
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
