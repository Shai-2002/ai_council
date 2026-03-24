"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ModelMentionInput, DIRECT_MODELS } from "./ModelMentionInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VersionNavigator } from "../chat/VersionNavigator";
import { RetryButton } from "../chat/RetryButton";

interface DirectMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelSlug?: string;
  currentVersion?: number;
  totalVersions?: number;
}

export function DirectChatInterface({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      });
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    // Add user message
    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text }]);
    
    // Simulate detecting mentions and streaming a response
    setIsLoading(true);
    console.log("Sending direct message:", text, { chatId });
    
    // Find mentioned models
    const mentionedModels = DIRECT_MODELS.filter(m => text.toLowerCase().includes(`@${m.mentionName}`));
    const defaultModel = DIRECT_MODELS[0]; // Claude by default
    const responder = mentionedModels.length > 0 ? mentionedModels[0] : defaultModel;

    setTimeout(() => {
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { 
        id: assistantMsgId, 
        role: 'assistant', 
        content: `I am ${responder.displayName}. This is a simulated response to your message: "${text}"`,
        modelSlug: responder.slug,
        currentVersion: 1,
        totalVersions: 1
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex -space-x-3 mb-4">
                 {DIRECT_MODELS.slice(0, 4).map((m, i) => (
                    <div key={i} className={`h-10 w-10 rounded-full border-2 border-zinc-50 dark:border-zinc-950 ${m.color} text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-black/10`}>
                      {m.mentionName[0].toUpperCase()}
                    </div>
                 ))}
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Raw Model Access
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Talk to any AI model directly without overarching personas. Tag models with <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">@</code> to get their specific inputs.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex w-full mb-6 justify-end">
                  <div className="flex max-w-[85%] sm:max-w-[75%] gap-4 flex-row-reverse">
                    <Avatar className="h-8 w-8 shrink-0 mt-1 bg-zinc-200 dark:bg-zinc-800">
                      <AvatarFallback className="text-sm font-medium text-zinc-900 dark:text-zinc-100">S</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2 items-end">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">You</span>
                      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              const modelInfo = DIRECT_MODELS.find(m => m.slug === msg.modelSlug) || DIRECT_MODELS[0];
              return (
                <div key={msg.id} className="flex w-full mb-6 justify-start">
                  <div className="flex max-w-[85%] sm:max-w-[75%] gap-4 flex-row">
                    <Avatar className={`h-8 w-8 shrink-0 mt-1 ${modelInfo.color} text-white`}>
                      <AvatarFallback className="text-sm font-bold">{modelInfo.mentionName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2 items-start w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{modelInfo.displayName}</span>
                        {modelInfo.slug.includes('grok') && <span className="text-sky-500 font-bold border border-sky-500/30 bg-sky-500/10 px-1 rounded text-[10px]">⚡</span>}
                        {modelInfo.slug.includes('claude') && <span className="text-purple-500 font-bold border border-purple-500/30 bg-purple-500/10 px-1 rounded text-[10px]">🟣</span>}
                        {modelInfo.slug.includes('gpt') && <span className="text-green-500 font-bold border border-green-500/30 bg-green-500/10 px-1 rounded text-[10px]">🟢</span>}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-zinc-900 shadow-sm rounded-tl-sm border-y border-r border-zinc-200 dark:border-zinc-800 w-full border-l-2`} style={{ borderLeftColor: modelInfo.color.replace('bg-', 'var(--') }}>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center justify-between gap-2 overflow-hidden group">
                          <div className="flex items-center gap-3">
                            <VersionNavigator
                              versionGroupId={msg.id}
                              currentVersion={msg.currentVersion || 1}
                              totalVersions={msg.totalVersions || 1}
                              onSwitchVersion={(v) => console.log('switch version', v)}
                            />
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto whitespace-nowrap hidden sm:inline-block">Just now</span>
                          </div>
                          <div className="flex flex-1 min-w-[100px] justify-end">
                            <RetryButton
                              messageId={msg.id}
                              onRetry={(id, m) => console.log('retry direct message', id, m)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}

          {isLoading && (
            <div className="flex w-full mb-6 justify-start">
              <div className="flex max-w-[85%] sm:max-w-[75%] gap-4 flex-row">
                <Avatar className="h-8 w-8 shrink-0 mt-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-500 animate-pulse">
                  <AvatarFallback className="text-sm font-bold">?</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 items-start">
                  <span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">Thinking...</span>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-zinc-900 shadow-sm rounded-tl-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        <div ref={messagesEndRef} className="h-px" />
      </div>

      <ModelMentionInput
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}
