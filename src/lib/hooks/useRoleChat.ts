'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { RoleSlug } from '@/types';

export function useRoleChat({
  roleSlug,
  workspaceId,
  chatId,
  projectId,
  initialMessages,
}: {
  roleSlug: RoleSlug;
  workspaceId: string | null;
  chatId?: string | null;
  projectId?: string | null;
  initialMessages?: Array<{ id: string; role: string; parts: Array<{ type: string; text: string }> }>;
}) {
  const chatHelpers = useChat({
    id: chatId || undefined,
    messages: initialMessages as Parameters<typeof useChat>[0]['messages'],
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        roleSlug,
        workspaceId,
        chatId: chatId || null,
        projectId: projectId || null,
      },
    }),
  });

  return chatHelpers;
}
