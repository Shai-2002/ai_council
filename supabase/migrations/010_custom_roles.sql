-- Custom roles table — user-defined personas
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  personality TEXT NOT NULL DEFAULT '',
  challenge_rules TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'indigo',
  icon TEXT NOT NULL DEFAULT 'User',
  artifact_type TEXT NOT NULL DEFAULT 'Analysis',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, slug)
);

ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workspace roles" ON custom_roles
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_custom_roles_workspace ON custom_roles(workspace_id, is_active, sort_order);

-- Add theme preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';

-- Updated_at trigger for custom_roles
CREATE TRIGGER custom_roles_updated BEFORE UPDATE ON custom_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
