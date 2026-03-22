'use client';

import { useChat } from 'ai/react';
import type { Message as AppMessage } from '@/types';
import type { RoleSlug } from '@/types';

export function useRoleChat({
  roleSlug,
  workspaceId,
  initialMessages = [],
}: {
  roleSlug: RoleSlug;
  workspaceId: string | null;
  initialMessages?: AppMessage[];
}) {
  const { messages, input, setInput, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      roleSlug,
      workspaceId,
    },
    initialMessages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
  });

  return {
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    input,
    setInput,
    handleSubmit,
    isLoading,
    append,
  };
}
