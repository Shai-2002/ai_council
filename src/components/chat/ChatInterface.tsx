"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Role } from "@/types";
import { useRoleChat } from "@/lib/hooks/useRoleChat";
import type { RoleSlug } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { FileUploadButton, FileChips, type UploadedFile } from "./FileUpload";

function getMessageContent(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || '';
}

export function ChatInterface({ role, workspaceId, chatId, projectId }: { role: Role; workspaceId?: string | null; chatId?: string; projectId?: string }) {
  const { messages, sendMessage, status } = useRoleChat({
    roleSlug: role.slug as RoleSlug,
    workspaceId: workspaceId ?? null,
    chatId: chatId ?? null,
    projectId: projectId ?? null,
  });
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const isLoading = status === 'streaming' || status === 'submitted';

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
      });
    }
  }, [messages]);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    });
  }, []);

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles(prev => {
      const map = new Map(prev.map(f => [f.name, f]));
      newFiles.forEach(f => map.set(f.name, f));
      return Array.from(map.values());
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    const doneFiles = files.filter(f => f.status === 'done');
    const hasFiles = doneFiles.length > 0;

    if (!trimmedInput && !hasFiles) return;
    if (isLoading) return;

    // Build the message — include file names so the API can find them
    let text = trimmedInput;
    if (hasFiles) {
      const fileNote = `[Attached files: ${doneFiles.map(f => f.name).join(', ')}]`;
      text = trimmedInput
        ? `${trimmedInput}\n\n${fileNote}`
        : `Please review the attached file${doneFiles.length > 1 ? 's' : ''}: ${doneFiles.map(f => f.name).join(', ')}`;
    }

    setInput("");
    setFiles([]);

    try {
      await sendMessage({ text });
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: getMessageContent(msg),
  }));

  const doneFiles = files.filter(f => f.status === 'done');
  const hasContent = input.trim() || doneFiles.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages — scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <div className="max-w-4xl mx-auto">
          {displayMessages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`p-4 rounded-2xl ${role.bgLight} mb-4`}>
                <span className={`text-2xl font-bold ${role.text}`}>{role.name[0]}</span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Chat with {role.name}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                {role.description}. Ask anything to get started.
              </p>
            </div>
          )}
          {displayMessages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} role={role} />
            </div>
          ))}
          {isLoading && displayMessages[displayMessages.length - 1]?.role !== 'assistant' && (
            <div className="flex w-full mb-6 justify-start">
              <div className="flex max-w-[75%] gap-4">
                <div className={`h-8 w-8 rounded-full ${role.bgDark} text-white flex items-center justify-center text-xs font-medium mt-1 shrink-0`}>
                  {role.name[0]}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{role.name}</span>
                  <div className="flex items-center gap-1.5 py-3 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Input area — pinned to bottom */}
      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <FileChips files={files} onRemove={removeFile} />
        <div className="px-4 sm:px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400 relative">
              <div className="shrink-0 self-end">
                <FileUploadButton
                  workspaceId={workspaceId ?? "default"}
                  context={{ roleSlug: role.slug, chatId, projectId }}
                  onFilesUploaded={handleFilesUploaded}
                />
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${role.name} for advice...`}
                className="block min-h-[48px] max-h-[120px] flex-1 resize-none border-0 bg-transparent py-3 pl-1 pr-14 text-left text-base leading-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
                rows={1}
              />
              <Button
                type="button"
                size="icon"
                className={`absolute right-2 bottom-2 h-9 w-9 rounded-xl transition-all ${
                  hasContent
                    ? `${role.bgDark} text-white hover:opacity-90`
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                }`}
                onClick={handleSend}
                disabled={!hasContent || isLoading}
              >
                <SendHorizontal className="h-4 w-4" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                The {role.title} analyzes your input based on {role.description.toLowerCase()}.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
