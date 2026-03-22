// lib/placeholder.ts
// These are stubs. Claude Code will replace implementations with real logic.

export async function onLogin(email: string) {
  console.log('[placeholder] login:', email);
  // TODO: Supabase auth
  window.location.href = '/ceo';
}

export async function onSignup(name: string, email: string) {
  console.log('[placeholder] signup:', name, email);
  // TODO: Supabase auth + workspace creation
  window.location.href = '/ceo';
}

export async function onSendMessage(roleSlug: string, message: string) {
  console.log('[placeholder] send:', roleSlug, message);
  // TODO: POST to /api/chat with streaming
  return {
    id: crypto.randomUUID(),
    role: 'assistant' as const,
    content: `[Mock response from ${roleSlug}] This is where the AI response would stream in. The ${roleSlug.toUpperCase()} role would analyze your message and provide structured feedback with personality.`,
  };
}

export async function onSelectRole(slug: string) {
  console.log('[placeholder] role selected:', slug);
  // TODO: Navigate + load conversation
}

export async function onViewArtifact(id: string) {
  console.log('[placeholder] view artifact:', id);
  // TODO: Fetch artifact detail
}

export async function onFinalizeArtifact(id: string) {
  console.log('[placeholder] finalize artifact:', id);
  // TODO: PATCH artifact status to 'final'
}

export async function onSubscribe(plan: string) {
  console.log('[placeholder] subscribe:', plan);
  // TODO: Razorpay checkout (future)
  alert(`Subscription to ${plan} plan — payment integration coming soon!`);
}

export async function onLogout() {
  console.log('[placeholder] logout');
  // TODO: Supabase signOut
  window.location.href = '/login';
}
