-- Allow 'direct' as a chat_type
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_chat_type_check;
ALTER TABLE chats ADD CONSTRAINT chats_chat_type_check
  CHECK (chat_type IN ('single', 'meeting_room', 'direct'));
