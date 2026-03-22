"use client";

import { useState, useRef, useEffect } from "react";
import { Message, Role } from "@/types";
import { MOCK_MESSAGES } from "@/lib/mock-data";
import { onSendMessage } from "@/lib/placeholder";
import { MessageBubble } from "./MessageBubble";
import { ArtifactCard } from "./ArtifactCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

export function ChatInterface({ role }: { role: Role }) {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate network request/streaming with a delay
      setTimeout(async () => {
        const response = await onSendMessage(role.slug, userMessage.content);
        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
              {/* Mock logic: if it's the specific assistant message, show the ArtifactCard */}
              {msg.id === "4" && (
                <ArtifactCard role={role} />
              )}
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
          <div className="relative group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${role.name} for advice...`}
              className={`min-h-[56px] w-full resize-none rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pr-14 py-4 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-400`}
              rows={1}
            />
            <Button 
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
