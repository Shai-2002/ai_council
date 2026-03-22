'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { RoleSlug } from '@/types';

export function useRoleChat({
  roleSlug,
  workspaceId,
}: {
  roleSlug: RoleSlug;
  workspaceId: string | null;
}) {
  const chatHelpers = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: {
        roleSlug,
        workspaceId,
      },
    }),
  });

  return chatHelpers;
}
