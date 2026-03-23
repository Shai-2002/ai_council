-- Meeting room participants track which roles are in a meeting room chat
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role_slug TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, role_slug)
);

-- Meeting turns track the order of responses in a meeting room
CREATE TABLE IF NOT EXISTS meeting_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  role_slug TEXT NOT NULL,
  turn_type TEXT NOT NULL CHECK (turn_type IN ('tagged', 'requested', 'simulation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'denied')),
  sequence_order INT NOT NULL DEFAULT 0,
  parent_turn_id UUID REFERENCES meeting_turns(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Simulation jobs for long-running multi-agent discussions
CREATE TABLE IF NOT EXISTS simulation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  trigger_message TEXT NOT NULL,
  tagged_roles TEXT[] NOT NULL,
  instructions JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage meeting participants" ON meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chats c
      JOIN workspaces w ON c.workspace_id = w.id
      WHERE c.id = meeting_participants.chat_id
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage meeting turns" ON meeting_turns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chats c
      JOIN workspaces w ON c.workspace_id = w.id
      WHERE c.id = meeting_turns.chat_id
      AND w.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage simulation jobs" ON simulation_jobs
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_turns_chat ON meeting_turns(chat_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_simulation_jobs_status ON simulation_jobs(status) WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS idx_meeting_participants_chat ON meeting_participants(chat_id);
