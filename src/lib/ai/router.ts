import { openrouter } from './provider';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';

/**
 * Resolve which model to use for a request.
 * Priority: message override > role default > system default
 */
export function resolveModel(options: {
  modelOverride?: string | null;
  roleDefaultModel?: string | null;
}) {
  const slug = options.modelOverride || options.roleDefaultModel || DEFAULT_MODEL;
  return {
    model: openrouter(slug),
    modelSlug: slug,
  };
}

/** Get display name for a model slug (for UI attribution) */
export function getModelDisplayName(slug: string): string {
  const names: Record<string, string> = {
    'anthropic/claude-sonnet-4.6': 'Claude Sonnet 4',
    'anthropic/claude-opus-4.6': 'Claude Opus 4',
    'anthropic/claude-haiku-4.5': 'Claude Haiku 4',
    'x-ai/grok-3': 'Grok 3',
    'x-ai/grok-3-mini': 'Grok 3 Mini',
    'openai/gpt-4o': 'GPT-4o',
    'openai/gpt-4o-mini': 'GPT-4o Mini',
    'openai/o3-mini': 'o3 Mini',
    'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    'google/gemini-2.5-pro': 'Gemini 2.5 Pro',
    'qwen/qwen3-32b': 'Qwen 3 32B',
    'perplexity/sonar': 'Perplexity Sonar',
    'meta-llama/llama-4-maverick': 'Llama 4 Maverick',
    'deepseek/deepseek-r1': 'DeepSeek R1',
    'mistralai/mistral-large-2411': 'Mistral Large',
  };
  return names[slug] || slug.split('/').pop() || slug;
}

export { DEFAULT_MODEL };
