'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { parseMentions } from '@/lib/meeting/mention-parser';
import { createClient } from '@/lib/supabase/client';

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

interface PendingSimulation {
  text: string;
  fileIds?: string[];
}

const ROLE_NAMES: Record<string, string> = {
  ceo: 'Aria', coo: 'Dev', cfo: 'Maya', product: 'Kai', marketing: 'Priya',
};

export function useMeetingRoom(chatId: string, workspaceId: string) {
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [activeRoles, setActiveRoles] = useState<ActiveRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulationPopup, setShowSimulationPopup] = useState(false);
  const [pendingSimulation, setPendingSimulation] = useState<PendingSimulation | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Subscribe to Realtime for simulation messages (worker inserts to messages table)
  useEffect(() => {
    if (!chatId || !simulationRunning) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`simulation-${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const newMsg = payload.new as { id: string; sender: string; role_slug: string; content: string; created_at: string };
        if (newMsg.sender !== 'assistant') return;

        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            role: 'assistant',
            roleSlug: newMsg.role_slug,
            roleName: ROLE_NAMES[newMsg.role_slug] || newMsg.role_slug?.toUpperCase(),
            content: newMsg.content,
            timestamp: new Date(newMsg.created_at),
          }];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, simulationRunning]);

  // Poll simulation job status when running
  useEffect(() => {
    if (!simulationRunning) return;

    const supabase = createClient();
    const interval = setInterval(async () => {
      // Check if all tagged roles have responded by checking messages
      const { data } = await supabase
        .from('simulation_jobs')
        .select('status')
        .eq('chat_id', chatId)
        .eq('status', 'running')
        .limit(1);

      if (!data || data.length === 0) {
        // No running jobs — simulation complete
        setSimulationRunning(false);
        setIsLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId, simulationRunning]);

  const sendMessage = useCallback(async (text: string, fileIds?: string[], skipSimulationCheck?: boolean) => {
    const parsed = parseMentions(text);

    if (parsed.mentions.length === 0) {
      return;
    }

    // Check for simulation BEFORE sending to API
    if (!skipSimulationCheck && parsed.isSimulationCandidate) {
      setPendingSimulation({ text, fileIds });
      setShowSimulationPopup(true);
      return;
    }

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

      // Handle JSON error responses
      if (contentType?.includes('application/json')) {
        const data = await res.json();
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

  const approveSimulation = useCallback(async () => {
    setShowSimulationPopup(false);
    if (!pendingSimulation) return;

    // Add user message to UI
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: pendingSimulation.text,
      timestamp: new Date(),
    }]);

    setIsLoading(true);
    setSimulationRunning(true);

    try {
      // Create simulation job (Railway worker will process it)
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: pendingSimulation.text,
          chatId,
          workspaceId,
        }),
      });

      const data = await res.json();
      if (!data.simulationId) {
        console.error('Simulation creation failed:', data);
        setIsLoading(false);
        setSimulationRunning(false);
      }
      // Messages will arrive via Realtime subscription
    } catch (error) {
      console.error('Simulation creation failed:', error);
      setIsLoading(false);
      setSimulationRunning(false);
    }

    setPendingSimulation(null);
  }, [pendingSimulation, chatId, workspaceId]);

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
          roleName: ROLE_NAMES[m.role_slug] || m.role_slug?.toUpperCase(),
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
    simulationRunning,
    sendMessage,
    approveSimulation,
    denySimulation,
    loadHistory,
    stop,
  };
}
