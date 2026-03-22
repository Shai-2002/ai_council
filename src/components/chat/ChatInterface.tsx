"use client";

import { useState, useRef, useEffect } from "react";
import { Role } from "@/types";
import { useRoleChat } from "@/lib/hooks/useRoleChat";
import type { RoleSlug } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Paperclip } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function getMessageContent(msg: { parts: Array<{ type: string; text?: string }> }): string {
  return msg.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('') || '';
}

export function ChatInterface({ role, workspaceId }: { role: Role; workspaceId?: string | null }) {
  const { messages, sendMessage, status } = useRoleChat({
    roleSlug: role.slug as RoleSlug,
    workspaceId: workspaceId ?? null,
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Convert UIMessage to our Message format for MessageBubble
  const displayMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: getMessageContent(msg),
  }));

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32"
      >
        <div className="max-w-4xl mx-auto">
          {displayMessages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} role={role} />
            </div>
          ))}
          {isLoading && displayMessages[displayMessages.length - 1]?.role !== 'assistant' && (
            <div className={`flex w-full mb-6 justify-start`}>
               <div className="flex max-w-[75%] gap-4">
                 <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-1" />
                 <div className="flex flex-col gap-2">
                    <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-24 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-sm border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                 </div>
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950/90 pt-10 pb-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            <Tooltip>
              <TooltipTrigger
                className="absolute left-3 bottom-3 p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-md disabled:opacity-50"
                disabled
              >
                <Paperclip className="h-5 w-5" />
              </TooltipTrigger>
              <TooltipContent>
                <p>File upload coming soon</p>
              </TooltipContent>
            </Tooltip>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${role.name} for advice...`}
              className={`min-h-[56px] w-full resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-12 pr-14 py-4 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-400`}
              rows={1}
            />
            <Button
              type="button"
              size="icon"
              className={`absolute right-2 bottom-2 h-10 w-10 rounded-xl transition-all ${
                input.trim()
                  ? `${role.bgDark} text-white hover:opacity-90`
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <SendHorizontal className="h-5 w-5" />
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
  );
}
