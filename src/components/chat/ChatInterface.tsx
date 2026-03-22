"use client";

import { useRef, useEffect } from "react";
import { Role, Message as AppMessage } from "@/types";
import { useRoleChat } from "@/lib/hooks/useRoleChat";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

export function ChatInterface({ role, workspaceId, initialMessages = [] }: { role: Role; workspaceId?: string | null; initialMessages?: AppMessage[] }) {
  const { messages, input, setInput, handleSubmit, isLoading } = useRoleChat({
    roleSlug: role.slug,
    workspaceId: workspaceId ?? null,
    initialMessages,
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32"
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div key={msg.id}>
              <MessageBubble message={msg} role={role} />
            </div>
          ))}
          {isLoading && (
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
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-zinc-950 dark:via-zinc-950/90 pt-10 pb-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${role.name} for advice...`}
              className={`min-h-[56px] w-full resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pr-14 py-4 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-400`}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className={`absolute right-2 bottom-2 h-10 w-10 rounded-xl transition-all ${
                input.trim()
                  ? `${role.bgDark} text-white hover:opacity-90`
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
              disabled={!input.trim() || isLoading}
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send Message</span>
            </Button>
          </form>
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
