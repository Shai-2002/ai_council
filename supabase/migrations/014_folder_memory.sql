-- Folder memory + health tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS memory_summary TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_tokens_used BIGINT DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_storage_bytes BIGINT DEFAULT 0;

ALTER TABLE chats ADD COLUMN IF NOT EXISTS key_points JSONB DEFAULT '[]'::jsonb;
