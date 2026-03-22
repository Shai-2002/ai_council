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
  // If email confirmation is disabled, user has a session immediately
  if (data.session) {
    window.location.href = '/ceo';
  } else {
    // Email confirmation is enabled — user needs to check email
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

  // For now, just update the subscription status (no real payment)
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

// Wave 2 Placeholders

export async function onUploadFiles(
  files: File[],
  workspaceId: string,
  context: { projectId?: string; chatId?: string; roleSlug?: string }
): Promise<Array<{ id: string; name: string; status: 'done' | 'failed' }>> {
  console.log('[placeholder] upload files:', files.map(f => f.name), context);
  await new Promise(r => setTimeout(r, 1500));
  return files.map(f => ({ id: crypto.randomUUID(), name: f.name, status: 'done' as const }));
}

export async function onExportArtifact(id: string, format: 'markdown' | 'pdf') {
  console.log('[placeholder] export artifact:', id, format);
}

export async function onCreateProject(name: string, description: string) {
  console.log('[placeholder] create project:', name, description);
  return { id: crypto.randomUUID(), name, description };
}

export async function onDeleteProject(id: string) {
  console.log('[placeholder] delete project:', id);
}

export async function onCreateChat(params: { title: string; projectId?: string; roleSlug?: string }) {
  console.log('[placeholder] create chat:', params);
  return { id: crypto.randomUUID(), ...params };
}

export async function onDeleteChat(id: string) {
  console.log('[placeholder] delete chat:', id);
}

export async function onMoveChat(chatId: string, targetProjectId: string | null) {
  console.log('[placeholder] move chat:', chatId, 'to project:', targetProjectId);
}

