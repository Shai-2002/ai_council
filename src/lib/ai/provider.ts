import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const roleModel = openrouter('anthropic/claude-sonnet-4-6');
export const synthesisModel = openrouter('anthropic/claude-opus-4-6');
