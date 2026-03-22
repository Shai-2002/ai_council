-- Fix: handle_new_user trigger function
-- Issues fixed:
-- 1. Added 'set search_path = public' for security definer context
-- 2. Added coalesce() for nullable metadata fields
-- 3. Simplified workspace name to avoid quote escaping issues
-- 4. Added explicit public. schema prefix

create or replace function public.handle_new_user()
returns trigger as $$
declare
  ws_id uuid;
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  insert into public.workspaces (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'My') || ' Workspace')
  returning id into ws_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Fix: Add ON DELETE CASCADE so deleting auth users cascades to profiles/workspaces
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

alter table public.workspaces drop constraint if exists workspaces_owner_id_fkey;
alter table public.workspaces add constraint workspaces_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete cascade;
