-- Commitments — behavioral rules defined by users
CREATE TABLE IF NOT EXISTS commitments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('definition', 'constraint', 'policy', 'commitment')),
  content TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'workspace',
  project_id UUID REFERENCES projects(id),
  hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS commitment_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commitment_id UUID REFERENCES commitments(id) NOT NULL,
  override_type TEXT NOT NULL CHECK (override_type IN ('one_time', 'update', 'deactivate')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workspace commitments" ON commitments
  FOR ALL USING (workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid()));

CREATE POLICY "Users manage own commitment overrides" ON commitment_overrides
  FOR ALL USING (
    commitment_id IN (
      SELECT id FROM commitments WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_commitments_workspace ON commitments(workspace_id, is_active);
