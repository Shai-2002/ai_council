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
    'anthropic/claude-sonnet-4.6': 'Claude Sonnet 4.6',
    'anthropic/claude-opus-4.6': 'Claude Opus 4.6',
    'openai/gpt-5.4': 'GPT-5.4',
    'openai/gpt-5.2': 'GPT-5.2',
    'x-ai/grok-4.1-fast': 'Grok 4.1 Fast',
    'x-ai/grok-3': 'Grok 3',
    'google/gemini-3-flash-preview': 'Gemini 3 Flash',
    'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    'deepseek/deepseek-v3.2': 'DeepSeek V3.2',
    'deepseek/deepseek-chat-v3-0324': 'DeepSeek Chat V3',
    'qwen/qwen3-235b-a22b-2507': 'Qwen 3 235B',
    'qwen/qwen3.5-flash-02-23': 'Qwen 3.5 Flash',
    'perplexity/sonar-deep-research': 'Perplexity Deep Research',
    'perplexity/sonar-pro-search': 'Perplexity Pro Search',
    'perplexity/sonar-reasoning-pro': 'Perplexity Reasoning Pro',
    'perplexity/sonar': 'Perplexity Sonar',
    'xiaomi/mimo-v2-pro': 'MiMo V2 Pro',
  };
  return names[slug] || slug.split('/').pop() || slug;
}

export { DEFAULT_MODEL };
