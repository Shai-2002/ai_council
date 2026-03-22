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
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  window.location.href = '/ceo';
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
