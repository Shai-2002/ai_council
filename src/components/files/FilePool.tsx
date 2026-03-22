"use client";

import { useState } from "react";
import { FileText, FileCode, Table, Image as ImageIcon, FileJson, Download, Trash2, UploadCloud, CheckCircle2, Clock } from "lucide-react";
import { MOCK_FILES } from "@/lib/mock-sidebar-data";
import { Button } from "@/components/ui/button";

export function FilePool({ context: _context }: { context: { projectId?: string; roleSlug?: string } }) {
  const [files, setFiles] = useState(MOCK_FILES);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf': return <FileText className="h-6 w-6 text-red-500 shrink-0" />;
      case 'docx': return <FileText className="h-6 w-6 text-blue-500 shrink-0" />;
      case 'md': 
      case 'txt': return <FileCode className="h-6 w-6 text-zinc-500 shrink-0" />;
      case 'csv': return <Table className="h-6 w-6 text-emerald-500 shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <ImageIcon className="h-6 w-6 text-indigo-500 shrink-0" />;
      case 'json': return <FileJson className="h-6 w-6 text-yellow-500 shrink-0" />;
      default: return <FileText className="h-6 w-6 text-zinc-400 shrink-0" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
        <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm mb-4 border border-zinc-100 dark:border-zinc-700 group-hover:scale-105 transition-transform">
          <UploadCloud className="h-6 w-6 text-indigo-500" />
        </div>
        <p className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Supports PDF, DOCX, MD, TXT, CSV up to 50MB
        </p>
      </div>

      {/* Files Grid */}
      {files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                    {getFileIcon(file.name)}
                  </div>
                </div>
                {file.extraction_status === 'done' ? (
                  <div className="px-2 py-1 rounded-md bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 text-[10px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Processing
                  </div>
                )}
              </div>
              
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mb-1" title={file.name}>
                {file.name}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                {formatSize(file.size_bytes)} • {new Date(file.created_at).toLocaleDateString()}
              </p>
              
              <div className="mt-auto flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                  <Download className="h-3 w-3 mr-1.5" /> Download
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <p className="text-sm text-zinc-500">No files uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
