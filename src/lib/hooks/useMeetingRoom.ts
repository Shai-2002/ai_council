'use client';

import { useState, useCallback, useRef } from 'react';
import { parseMentions, type ParsedMessage } from '@/lib/meeting/mention-parser';

interface MeetingMessage {
  id: string;
  role: 'user' | 'assistant';
  roleSlug?: string;
  roleName?: string;
  content: string;
  timestamp: Date;
}

interface ActiveRole {
  roleSlug: string;
  roleName: string;
  content: string;
  isStreaming: boolean;
}

export function useMeetingRoom(chatId: string, workspaceId: string) {
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [activeRoles, setActiveRoles] = useState<ActiveRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulationPopup, setShowSimulationPopup] = useState(false);
  const [pendingSimulation, setPendingSimulation] = useState<ParsedMessage | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string, fileIds?: string[]) => {
    // Add user message to UI immediately
    const userMsg: MeetingMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const abortController = new AbortController();
      abortRef.current = abortController;

      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chatId, workspaceId, fileIds }),
        signal: abortController.signal,
      });

      const contentType = res.headers.get('content-type');

      // Check if it's a simulation candidate response (JSON, not SSE)
      if (contentType?.includes('application/json')) {
        const data = await res.json();
        if (data.type === 'simulation_candidate') {
          const parsed = parseMentions(text);
          setPendingSimulation(parsed);
          setShowSimulationPopup(true);
          setIsLoading(false);
          return;
        }
        if (data.error) {
          console.error('Meeting API error:', data.error);
          setIsLoading(false);
          return;
        }
      }

      // Process SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader');

      let currentRoleContent = '';
      let currentRoleSlug = '';
      let currentRoleName = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'role_start':
                currentRoleSlug = data.roleSlug;
                currentRoleName = data.roleName;
                currentRoleContent = '';
                setActiveRoles(prev => [...prev, {
                  roleSlug: data.roleSlug,
                  roleName: data.roleName,
                  content: '',
                  isStreaming: true,
                }]);
                break;

              case 'token':
                currentRoleContent += data.content;
                setActiveRoles(prev =>
                  prev.map(r => r.roleSlug === data.roleSlug
                    ? { ...r, content: currentRoleContent }
                    : r
                  )
                );
                break;

              case 'role_complete': {
                const completedMsg: MeetingMessage = {
                  id: `${data.roleSlug}-${Date.now()}`,
                  role: 'assistant',
                  roleSlug: currentRoleSlug,
                  roleName: currentRoleName,
                  content: currentRoleContent,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, completedMsg]);
                setActiveRoles(prev => prev.filter(r => r.roleSlug !== data.roleSlug));
                currentRoleContent = '';
                break;
              }

              case 'done':
                break;

              case 'error':
                console.error('Role error:', data);
                setActiveRoles(prev => prev.filter(r => r.roleSlug !== data.roleSlug));
                break;
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Meeting room error:', error);
      }
    } finally {
      setIsLoading(false);
      setActiveRoles([]);
    }
  }, [chatId, workspaceId]);

  const approveSimulation = useCallback(() => {
    setShowSimulationPopup(false);
    if (pendingSimulation) {
      sendMessage(pendingSimulation.rawText);
    }
    setPendingSimulation(null);
  }, [pendingSimulation, sendMessage]);

  const denySimulation = useCallback(() => {
    setShowSimulationPopup(false);
    setPendingSimulation(null);
  }, []);

  const loadHistory = useCallback(async () => {
    const res = await fetch(`/api/chats/${chatId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: { id: string; sender: string; role_slug: string; content: string; created_at: string }) => ({
          id: m.id,
          role: m.sender as 'user' | 'assistant',
          roleSlug: m.role_slug,
          roleName: m.role_slug ? m.role_slug.toUpperCase() : undefined,
          content: m.content,
          timestamp: new Date(m.created_at),
        })));
      }
    }
  }, [chatId]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    activeRoles,
    isLoading,
    showSimulationPopup,
    sendMessage,
    approveSimulation,
    denySimulation,
    loadHistory,
    stop,
  };
}
