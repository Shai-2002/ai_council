"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Role } from "@/types";
import { useRoleChat } from "@/lib/hooks/useRoleChat";
import type { RoleSlug } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { FileUpload, UploadedFile } from "./FileUpload";

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
  const [resetSignal, setResetSignal] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUp = useRef(false);
  const isLoading = status === 'streaming' || status === 'submitted';

  // Track if user has manually scrolled up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 100;
  }, []);

  // Auto-scroll only if user hasn't scrolled up — use 'instant' to avoid jitter
  useEffect(() => {
    if (!isUserScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;
    const text = input;
    setInput("");
    setFiles([]);
    setResetSignal(prev => prev + 1); // Bug 1: clear file chips in FileUpload
    await sendMessage({ text });
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

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-32"
      >
        <div className="max-w-4xl mx-auto">
          {displayMessages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} role={role} />
            </div>
          ))}
          {/* Bug 6: Clean typing indicator */}
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
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950/90 pt-10 pb-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400 w-full relative">
            <div className="flex items-end w-full">
              <FileUpload
                onFilesChange={setFiles}
                workspaceId={workspaceId ?? "default"}
                context={{ roleSlug: role.slug, chatId, projectId }}
                resetSignal={resetSignal}
              />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask ${role.name} for advice...`}
                className="min-h-[56px] w-full resize-none border-0 bg-transparent py-4 pl-0 pr-14 text-base shadow-none focus-visible:ring-0 rounded-none focus-visible:ring-offset-0"
                rows={1}
              />
              <Button
                type="button"
                size="icon"
                className={`absolute right-2 bottom-2 h-10 w-10 rounded-xl transition-all ${
                  input.trim() || files.length > 0
                    ? `${role.bgDark} text-white hover:opacity-90`
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
                onClick={handleSend}
                disabled={(!input.trim() && files.length === 0) || isLoading}
              >
                <SendHorizontal className="h-5 w-5" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>

          <div className="text-center mt-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              The {role.title} analyzes your input based on {role.description.toLowerCase()}.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
