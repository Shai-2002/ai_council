-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  avatar_url text,
  subscription_status text default 'free' check (subscription_status in ('free', 'active', 'canceled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workspaces
create table workspaces (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) not null,
  name text not null default 'My Workspace',
  company_context jsonb default '{}',
  created_at timestamptz default now()
);

-- Messages (chat history per role)
create table messages (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  role_slug text not null check (role_slug in ('ceo', 'coo', 'cfo', 'product', 'marketing')),
  sender text not null check (sender in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Artifacts (structured outputs — the core value)
create table artifacts (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  role_slug text not null,
  artifact_type text not null,
  title text not null,
  structured_data jsonb not null,
  status text default 'draft' check (status in ('draft', 'final')),
  version integer default 1,
  parent_id uuid references artifacts(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table messages enable row level security;
alter table artifacts enable row level security;

-- RLS policies
create policy "Own profile" on profiles for all using (auth.uid() = id);

create policy "Own workspaces" on workspaces for all using (auth.uid() = owner_id);

create policy "Messages via workspace" on messages for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

create policy "Artifacts via workspace" on artifacts for all
  using (workspace_id in (select id from workspaces where owner_id = auth.uid()));

-- Auto-provision on signup: profile + workspace
create or replace function handle_new_user()
returns trigger as $$
declare
  ws_id uuid;
begin
  insert into profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  insert into workspaces (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'My') || '''s Workspace')
  returning id into ws_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated before update on profiles
  for each row execute function update_updated_at();
