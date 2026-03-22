"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, FileText, FileCode, Table, Image as ImageIcon, FileJson, X, CheckCircle2 } from "lucide-react";
import { onUploadFiles } from "@/lib/placeholder";

export type UploadedFile = {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'done' | 'failed';
};

export function FileUpload({
  onFilesChange,
  workspaceId = "default",
  context = {},
  resetSignal = 0,
}: {
  onFilesChange: (files: UploadedFile[]) => void;
  workspaceId?: string;
  context?: { projectId?: string; chatId?: string; roleSlug?: string };
  resetSignal?: number;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear files when resetSignal changes (triggered after message send)
  useEffect(() => {
    if (resetSignal > 0) {
      setFiles([]);
      onFilesChange([]);
    }
  }, [resetSignal, onFilesChange]);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
      case 'docx': return <FileText className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'md':
      case 'txt': return <FileCode className="h-4 w-4 text-zinc-500 shrink-0" />;
      case 'csv': return <Table className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <ImageIcon className="h-4 w-4 text-indigo-500 shrink-0" />;
      case 'json': return <FileJson className="h-4 w-4 text-yellow-500 shrink-0" />;
      default: return <FileText className="h-4 w-4 text-zinc-400 shrink-0" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFiles = Array.from(e.target.files);

    const newUploads: UploadedFile[] = selectedFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      size: f.size,
      status: 'uploading' as const,
    }));

    setFiles(prev => {
      const updated = [...prev, ...newUploads];
      onFilesChange(updated);
      return updated;
    });

    try {
      const results = await onUploadFiles(selectedFiles, workspaceId, context);

      setFiles(prev => {
        const updated = prev.map(p => {
          const matchedResult = results.find(r => r.name === p.name);
          if (matchedResult) {
            return { ...p, id: matchedResult.id, status: matchedResult.status };
          }
          return p;
        });
        onFilesChange(updated);
        return updated;
      });
    } catch {
      setFiles(prev => {
        const updated = prev.map(p => newUploads.find(nu => nu.id === p.id) ? { ...p, status: 'failed' as const } : p);
        onFilesChange(updated as UploadedFile[]);
        return updated as UploadedFile[];
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      onFilesChange(updated);
      return updated;
    });
  };

  return (
    <div className="w-full">
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2 pb-3 mb-1 border-b border-zinc-100 dark:border-zinc-800/50">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-1.5 px-3 text-xs shadow-sm max-w-[200px]"
            >
              {getFileIcon(file.name)}
              <div className="flex flex-col flex-1 min-w-0 pr-2">
                <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
                  {file.name}
                </span>
                <div className="flex items-center gap-1.5 opacity-80 mt-0.5">
                  <span className="text-[10px] text-zinc-500">{formatSize(file.size)}</span>
                  {file.status === 'uploading' && <div className="h-1 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0"><div className="h-full bg-indigo-500 animate-pulse w-2/3" /></div>}
                  {file.status === 'done' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                  {file.status === 'failed' && <span className="text-[10px] text-red-500 font-medium shrink-0">Failed</span>}
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shrink-0 rounded-md p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.docx,.md,.txt,.csv,.png,.jpg,.jpeg,.json"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-3 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 outline-none"
        title="Upload files"
      >
        <Paperclip className="h-5 w-5" />
      </button>
    </div>
  );
}
