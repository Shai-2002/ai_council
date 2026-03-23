'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { RoleSlug } from '@/types';

export function useRoleChat({
  roleSlug,
  workspaceId,
  chatId,
  projectId,
  fileIds,
}: {
  roleSlug: RoleSlug;
  workspaceId: string | null;
  chatId?: string | null;
  projectId?: string | null;
  fileIds?: string[];
}) {
  const chatHelpers = useChat({
    id: chatId || undefined,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        roleSlug,
        workspaceId,
        chatId: chatId || null,
        projectId: projectId || null,
        fileIds: fileIds || [],
      },
    }),
  });

  return chatHelpers;
}
