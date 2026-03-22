// lib/placeholder.ts
// Real implementations backed by Supabase

import { createClient } from '@/lib/supabase/client';

export async function onLogin(email: string, password: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  window.location.href = '/ceo';
}

export async function onSignup(name: string, email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (data.session) {
    window.location.href = '/ceo';
  } else {
    throw new Error('Check your email for a confirmation link, then log in.');
  }
}

export async function onSelectRole(slug: string) {
  window.location.href = `/${slug}`;
}

export async function onViewArtifact(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Failed to fetch artifact:', error.message);
    return null;
  }
  return data;
}

export async function onFinalizeArtifact(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('artifacts')
    .update({ status: 'final' })
    .eq('id', id);
  if (error) {
    console.error('Failed to finalize artifact:', error.message);
    throw new Error(error.message);
  }
}

export async function onSubscribe(plan: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }
  if (plan === 'Free') return;
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active' })
    .eq('id', user.id);
  if (error) {
    console.error('Failed to update subscription:', error.message);
    return;
  }
  alert(`Subscribed to ${plan} plan! (Payment integration coming soon)`);
}

export async function onLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = '/login';
}

// ===== Wave 2: Real Implementations =====

export async function onUploadFiles(
  files: File[],
  workspaceId: string,
  context: { projectId?: string; chatId?: string; roleSlug?: string }
): Promise<Array<{ id: string; name: string; status: 'done' | 'failed' }>> {
  const results: Array<{ id: string; name: string; status: 'done' | 'failed' }> = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);
    if (context.projectId) formData.append('projectId', context.projectId);
    if (context.chatId) formData.append('chatId', context.chatId);
    if (context.roleSlug) formData.append('roleSlug', context.roleSlug);

    try {
      const res = await fetch('/api/files/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        const first = Array.isArray(data) ? data[0] : data;
        results.push({ id: first.id, name: file.name, status: 'done' });
      } else {
        results.push({ id: '', name: file.name, status: 'failed' });
      }
    } catch {
      results.push({ id: '', name: file.name, status: 'failed' });
    }
  }
  return results;
}

export async function onExportArtifact(id: string, format: 'markdown' | 'pdf') {
  if (format === 'markdown') {
    const res = await fetch(`/api/artifacts/${id}/export?format=markdown`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact-${id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (format === 'pdf') {
    const res = await fetch(`/api/artifacts/${id}/export?format=html`);
    const html = await res.text();
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }
}

export async function onCreateProject(name: string, description: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (!workspace) throw new Error('No workspace found');

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workspaceId: workspace.id, name, description }),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return await res.json();
}

export async function onDeleteProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function onCreateChat(params: { title: string; projectId?: string; roleSlug?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (!workspace) throw new Error('No workspace found');

  const res = await fetch('/api/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: workspace.id,
      title: params.title,
      projectId: params.projectId || null,
      roleSlug: params.roleSlug || null,
      chatType: 'single',
    }),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return await res.json();
}

export async function onDeleteChat(id: string) {
  const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete chat');
}

export async function onMoveChat(chatId: string, targetProjectId: string | null) {
  const res = await fetch(`/api/chats/${chatId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: targetProjectId }),
  });
  if (!res.ok) throw new Error('Failed to move chat');
}
