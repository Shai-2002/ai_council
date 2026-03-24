"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ModelMentionInput, DIRECT_MODELS } from "./ModelMentionInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VersionNavigator } from "../chat/VersionNavigator";
import { RetryButton } from "../chat/RetryButton";
import { useWorkspace } from "@/lib/hooks/useWorkspace";

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
  const { workspaceId } = useWorkspace();

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
    if (!workspaceId) return;

    const userMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: text }]);
    setIsLoading(true);

    try {
      // Build UIMessage format for the /api/direct endpoint
      const allMessages = [...messages, { id: userMsgId, role: 'user' as const, content: text }];
      const uiMessages = allMessages.map(m => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text', text: m.content }],
      }));

      const res = await fetch('/api/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: uiMessages,
          workspaceId,
          chatId,
        }),
      });

      const contentType = res.headers.get('content-type') || '';

      // Check if it's SSE (multi-model chaining) or UIMessageStream (single model)
      if (contentType.includes('text/event-stream')) {
        // SSE — parse model_start, token, model_complete events
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');
        const decoder = new TextDecoder();
        let currentModelSlug = '';
        let currentContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'model_start') {
                currentModelSlug = data.modelSlug;
                currentContent = '';
              } else if (data.type === 'token') {
                currentContent += data.content;
                setMessages(prev => {
                  const existing = prev.find(m => m.id === `direct-${currentModelSlug}`);
                  if (existing) {
                    return prev.map(m => m.id === `direct-${currentModelSlug}` ? { ...m, content: currentContent } : m);
                  }
                  return [...prev, { id: `direct-${currentModelSlug}`, role: 'assistant', content: currentContent, modelSlug: currentModelSlug }];
                });
              } else if (data.type === 'model_complete') {
                // Finalize — replace temp ID with a stable one
                const finalId = `direct-${currentModelSlug}-${Date.now()}`;
                setMessages(prev => prev.map(m => m.id === `direct-${currentModelSlug}` ? { ...m, id: finalId } : m));
              }
            } catch { /* skip malformed */ }
          }
        }
      } else {
        // UIMessageStream — single model response (use similar parsing to useChat)
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');
        const decoder = new TextDecoder();
        let assistantContent = '';
        const assistantId = `assistant-${Date.now()}`;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // UIMessageStream format: extract text deltas
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('d:')) {
              // UIMessageStream text delta format
              try {
                const payload = JSON.parse(line.slice(2));
                if (typeof payload === 'string') {
                  assistantContent += payload;
                } else if (payload?.type === 'text' || payload?.text) {
                  assistantContent += payload.text || payload;
                }
              } catch { /* skip */ }
            } else if (line.startsWith('0:')) {
              // Older format: 0:"text chunk"
              try {
                const text = JSON.parse(line.slice(2));
                if (typeof text === 'string') assistantContent += text;
              } catch { /* skip */ }
            }
          }
          setMessages(prev => {
            const existing = prev.find(m => m.id === assistantId);
            if (existing) {
              return prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m);
            }
            return [...prev, { id: assistantId, role: 'assistant', content: assistantContent }];
          });
        }
      }
    } catch (err) {
      console.error('Direct chat error:', err);
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'assistant', content: 'Failed to get response. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (messageId: string, modelOverride?: string) => {
    try {
      const res = await fetch('/api/messages/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, model_override: modelOverride, chat_id: chatId }),
      });
      if (!res.ok) return;
      // For now, just show a toast-like notification. Full stream parsing would go here.
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  const handleSwitchVersion = async (versionGroupId: string, version: number) => {
    try {
      await fetch('/api/messages/version', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionGroupId, activeVersion: version }),
      });
    } catch (err) {
      console.error('Version switch failed:', err);
    }
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
                Talk to any AI model directly without personas. Tag models with <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">@</code> to route your message.
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
                      </div>
                      <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-zinc-900 shadow-sm rounded-tl-sm border border-zinc-200 dark:border-zinc-800 w-full">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center justify-between gap-2 overflow-hidden">
                          <VersionNavigator
                            versionGroupId={msg.id}
                            currentVersion={msg.currentVersion || 1}
                            totalVersions={msg.totalVersions || 1}
                            onSwitchVersion={(v) => handleSwitchVersion(msg.id, v)}
                          />
                          <RetryButton
                            messageId={msg.id}
                            onRetry={handleRetry}
                          />
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
                  <div className="px-4 py-3 rounded-2xl text-sm bg-white dark:bg-zinc-900 shadow-sm rounded-tl-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
