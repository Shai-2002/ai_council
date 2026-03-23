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

// Helper to get file icon — exported for use in ChatInterface
export function getFileIcon(filename: string, size: 'sm' | 'md' = 'sm') {
  const cls = size === 'sm' ? 'h-4 w-4 shrink-0' : 'h-5 w-5 shrink-0';
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf': return <FileText className={`${cls} text-red-500`} />;
    case 'docx': return <FileText className={`${cls} text-blue-500`} />;
    case 'md':
    case 'txt': return <FileCode className={`${cls} text-zinc-500`} />;
    case 'csv': return <Table className={`${cls} text-emerald-500`} />;
    case 'png':
    case 'jpg':
    case 'jpeg': return <ImageIcon className={`${cls} text-indigo-500`} />;
    case 'json': return <FileJson className={`${cls} text-yellow-500`} />;
    default: return <FileText className={`${cls} text-zinc-400`} />;
  }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function FileUploadButton({
  onFilesUploaded,
  workspaceId = "default",
  context = {},
}: {
  onFilesUploaded: (newFiles: UploadedFile[]) => void;
  workspaceId?: string;
  context?: { projectId?: string; chatId?: string; roleSlug?: string };
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const selectedFiles = Array.from(e.target.files);

    // Immediately report uploading state
    const uploading: UploadedFile[] = selectedFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      name: f.name,
      size: f.size,
      status: 'uploading' as const,
    }));
    onFilesUploaded(uploading);

    // Upload to real API
    try {
      const results = await onUploadFiles(selectedFiles, workspaceId, context);
      const done: UploadedFile[] = uploading.map(u => {
        const match = results.find(r => r.name === u.name);
        return match
          ? { ...u, id: match.id, status: match.status }
          : { ...u, status: 'failed' as const };
      });
      onFilesUploaded(done);
    } catch {
      onFilesUploaded(uploading.map(u => ({ ...u, status: 'failed' as const })));
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".pdf,.docx,.md,.txt,.csv,.png,.jpg,.jpeg,.json"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-3 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 outline-none"
        title="Upload files"
      >
        <Paperclip className="h-5 w-5" />
      </button>
    </>
  );
}

// File chips row — rendered separately above the input
export function FileChips({
  files,
  onRemove,
}: {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3 pb-2">
      {files.map(file => (
        <div
          key={file.id}
          className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-1.5 px-3 text-xs shadow-sm max-w-[220px]"
        >
          {getFileIcon(file.name)}
          <div className="flex flex-col flex-1 min-w-0 pr-1">
            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
              {file.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-zinc-500">{formatFileSize(file.size)}</span>
              {file.status === 'uploading' && (
                <div className="h-1 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-indigo-500 animate-pulse w-2/3" />
                </div>
              )}
              {file.status === 'done' && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
              {file.status === 'failed' && <span className="text-[10px] text-red-500 font-medium shrink-0">Failed</span>}
            </div>
          </div>
          <button
            onClick={() => onRemove(file.id)}
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 shrink-0 rounded-md p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Legacy export for backward compat — wraps the button
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

  useEffect(() => {
    if (resetSignal > 0) {
      setFiles([]);
      onFilesChange([]);
    }
  }, [resetSignal, onFilesChange]);

  return (
    <FileUploadButton
      workspaceId={workspaceId}
      context={context}
      onFilesUploaded={(newFiles) => {
        setFiles(newFiles);
        onFilesChange(newFiles);
      }}
    />
  );
}
