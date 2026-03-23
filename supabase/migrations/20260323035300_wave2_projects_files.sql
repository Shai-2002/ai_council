-- =============================================
-- PROJECTS
-- =============================================
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;
drop policy if exists "Project access via workspace" on projects;
create policy "Project access via workspace" on projects for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

-- =============================================
-- CHATS
-- =============================================
create table if not exists chats (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  title text not null default 'New chat',
  chat_type text not null default 'single' check (chat_type in ('single', 'meeting_room')),
  role_slug text check (role_slug in ('ceo', 'coo', 'cfo', 'product', 'marketing')),
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table chats enable row level security;
drop policy if exists "Chat access via workspace" on chats;
create policy "Chat access via workspace" on chats for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

-- =============================================
-- MESSAGES (add chat_id column)
-- =============================================
alter table messages add column if not exists chat_id uuid references chats(id) on delete cascade;
create index if not exists idx_messages_chat_id on messages(chat_id);
create index if not exists idx_messages_workspace_role on messages(workspace_id, role_slug);

-- =============================================
-- FILES
-- =============================================
create table if not exists files (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade,
  chat_id uuid references chats(id) on delete cascade,
  role_slug text,
  name text not null,
  file_type text not null,
  size_bytes bigint not null,
  storage_path text not null,
  extracted_text text,
  extraction_status text default 'pending' check (extraction_status in ('pending', 'processing', 'done', 'failed')),
  source text default 'upload' check (source in ('upload', 'generated')),
  created_at timestamptz default now()
);

alter table files enable row level security;
drop policy if exists "File access via workspace" on files;
create policy "File access via workspace" on files for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

-- =============================================
-- ADD project_id + chat_id TO ARTIFACTS
-- =============================================
alter table artifacts add column if not exists project_id uuid references projects(id) on delete cascade;
alter table artifacts add column if not exists chat_id uuid references chats(id) on delete cascade;

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_chats_workspace on chats(workspace_id);
create index if not exists idx_chats_project on chats(project_id);
create index if not exists idx_files_project on files(project_id);
create index if not exists idx_files_chat on files(chat_id);
create index if not exists idx_files_workspace_role on files(workspace_id, role_slug);
create index if not exists idx_artifacts_project on artifacts(project_id);
create index if not exists idx_artifacts_chat on artifacts(chat_id);

-- =============================================
-- TRIGGERS
-- =============================================
drop trigger if exists projects_updated on projects;
create trigger projects_updated before update on projects
  for each row execute function update_updated_at();

drop trigger if exists chats_updated on chats;
create trigger chats_updated before update on chats
  for each row execute function update_updated_at();

-- =============================================
-- ENABLE REALTIME on messages table
-- =============================================
do $$
begin
  alter publication supabase_realtime add table messages;
exception when others then
  raise notice 'Could not add messages to realtime publication: %', SQLERRM;
end;
$$;
