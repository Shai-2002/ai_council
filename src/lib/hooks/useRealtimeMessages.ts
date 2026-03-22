'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeMessage {
  id: string;
  workspace_id: string;
  chat_id: string | null;
  role_slug: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useRealtimeMessages(
  chatId: string | null,
  onNewMessage: (msg: RealtimeMessage) => void
) {
  useEffect(() => {
    if (!chatId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          onNewMessage(payload.new as RealtimeMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage]);
}
