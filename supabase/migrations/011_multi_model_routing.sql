-- Models reference table (read-only, no RLS needed)
CREATE TABLE IF NOT EXISTS models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  supports_vision BOOLEAN DEFAULT false,
  supports_streaming BOOLEAN DEFAULT true,
  cost_tier TEXT DEFAULT 'standard',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed available models
INSERT INTO models (slug, display_name, provider, category, supports_vision, cost_tier) VALUES
  ('anthropic/claude-sonnet-4-20250514', 'Claude Sonnet 4', 'Anthropic', 'reasoning', false, 'standard'),
  ('anthropic/claude-opus-4-20250514', 'Claude Opus 4', 'Anthropic', 'reasoning', false, 'premium'),
  ('anthropic/claude-haiku-4-20250414', 'Claude Haiku 4', 'Anthropic', 'fast', false, 'cheap'),
  ('x-ai/grok-3', 'Grok 3', 'xAI', 'reasoning', false, 'standard'),
  ('x-ai/grok-3-mini', 'Grok 3 Mini', 'xAI', 'fast', false, 'cheap'),
  ('openai/gpt-4o', 'GPT-4o', 'OpenAI', 'reasoning', true, 'standard'),
  ('openai/gpt-4o-mini', 'GPT-4o Mini', 'OpenAI', 'fast', true, 'cheap'),
  ('openai/o3-mini', 'o3 Mini', 'OpenAI', 'reasoning', false, 'standard'),
  ('google/gemini-2.5-flash', 'Gemini 2.5 Flash', 'Google', 'fast', true, 'cheap'),
  ('google/gemini-2.5-pro', 'Gemini 2.5 Pro', 'Google', 'reasoning', true, 'standard'),
  ('qwen/qwen3-32b', 'Qwen 3 32B', 'Qwen', 'reasoning', false, 'cheap'),
  ('perplexity/sonar', 'Perplexity Sonar', 'Perplexity', 'search', false, 'standard'),
  ('meta-llama/llama-4-maverick', 'Llama 4 Maverick', 'Meta', 'reasoning', false, 'cheap'),
  ('deepseek/deepseek-r1', 'DeepSeek R1', 'DeepSeek', 'reasoning', false, 'cheap'),
  ('mistralai/mistral-large-2411', 'Mistral Large', 'Mistral', 'reasoning', false, 'standard')
ON CONFLICT (slug) DO NOTHING;

-- Add default_model to custom_roles
ALTER TABLE custom_roles ADD COLUMN IF NOT EXISTS default_model TEXT DEFAULT 'anthropic/claude-sonnet-4-20250514';

-- Add model_used to messages for tracking
ALTER TABLE messages ADD COLUMN IF NOT EXISTS model_used TEXT;

-- Add version columns to messages for Feature 2
ALTER TABLE messages ADD COLUMN IF NOT EXISTS version_group_id UUID;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_active_version BOOLEAN DEFAULT true;

-- Index for version lookups
CREATE INDEX IF NOT EXISTS idx_messages_version_group ON messages(version_group_id) WHERE version_group_id IS NOT NULL;
