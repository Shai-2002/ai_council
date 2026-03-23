-- Create chats for existing role conversations
INSERT INTO chats (workspace_id, role_slug, title, chat_type)
SELECT DISTINCT workspace_id, role_slug,
  CASE role_slug
    WHEN 'ceo' THEN 'Chat with Aria (CEO)'
    WHEN 'coo' THEN 'Chat with Dev (COO)'
    WHEN 'cfo' THEN 'Chat with Maya (CFO)'
    WHEN 'product' THEN 'Chat with Kai (Product)'
    WHEN 'marketing' THEN 'Chat with Priya (Marketing)'
  END,
  'single'
FROM messages
WHERE chat_id IS NULL
  AND workspace_id IS NOT NULL
  AND role_slug IS NOT NULL
ON CONFLICT DO NOTHING;

-- Link existing messages to their chats
UPDATE messages m
SET chat_id = c.id
FROM chats c
WHERE m.workspace_id = c.workspace_id
  AND m.role_slug = c.role_slug
  AND m.chat_id IS NULL;

-- Link existing artifacts to their chats
UPDATE artifacts a
SET chat_id = c.id
FROM chats c
WHERE a.workspace_id = c.workspace_id
  AND a.role_slug = c.role_slug
  AND a.chat_id IS NULL;
