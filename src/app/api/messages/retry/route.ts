import { streamText } from 'ai';
import { z } from 'zod';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { resolveModel } from '@/lib/ai/router';
import { ROLE_CONFIGS, type RoleConfig } from '@/lib/ai/roles';
import type { RoleSlug } from '@/types';

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { messageId, modelOverride, chatId } = await req.json();

  if (!messageId || !chatId) {
    return new Response('messageId and chatId required', { status: 400 });
  }

  // Fetch the original assistant message
  const { data: originalMsg } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single();

  if (!originalMsg || originalMsg.sender !== 'assistant') {
    return new Response('Message not found or not an assistant message', { status: 404 });
  }

  const roleSlug = originalMsg.role_slug;
  const workspaceId = originalMsg.workspace_id;

  // Resolve role config (same logic as chat route)
  let roleConfig: RoleConfig | null = ROLE_CONFIGS[roleSlug as RoleSlug] || null;
  let roleDefaultModel: string | null = null;

  if (workspaceId) {
    const { data: customRole } = await supabase
      .from('custom_roles')
      .select('personality, name, title, challenge_rules, artifact_type, default_model')
      .eq('workspace_id', workspaceId)
      .eq('slug', roleSlug)
      .eq('is_active', true)
      .single();

    if (customRole) {
      roleDefaultModel = customRole.default_model || null;
      if (customRole.personality) {
        roleConfig = roleConfig
          ? { ...roleConfig, systemPrompt: customRole.personality + (customRole.challenge_rules ? '\n\n' + customRole.challenge_rules : ''), name: customRole.name, title: customRole.title, artifactType: customRole.artifact_type || roleConfig.artifactType }
          : { slug: roleSlug as RoleSlug, name: customRole.name, title: customRole.title, systemPrompt: customRole.personality, outputSchema: z.any(), artifactType: customRole.artifact_type || 'Analysis' };
      }
    }
  }

  if (!roleConfig) {
    return new Response('Role not found', { status: 400 });
  }

  // Find the user message that prompted this response (the message before it)
  const { data: precedingMessages } = await supabase
    .from('messages')
    .select('role_slug, sender, content')
    .eq('chat_id', chatId)
    .eq('is_active_version', true)
    .lt('created_at', originalMsg.created_at)
    .order('created_at', { ascending: true })
    .limit(20);

  const conversationHistory = (precedingMessages || []).map(m => ({
    role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: m.content,
  }));

  // Resolve model
  const { model, modelSlug } = resolveModel({
    modelOverride: modelOverride || null,
    roleDefaultModel,
  });

  // Set up version group
  const versionGroupId = originalMsg.version_group_id || originalMsg.id;
  const currentMaxVersion = originalMsg.version_number || 1;

  // Mark old version as inactive
  await supabase
    .from('messages')
    .update({ is_active_version: false })
    .eq('version_group_id', versionGroupId);

  // Also mark the original if it doesn't have a version_group_id yet
  if (!originalMsg.version_group_id) {
    await supabase
      .from('messages')
      .update({ version_group_id: versionGroupId, version_number: 1, is_active_version: false })
      .eq('id', originalMsg.id);
  }

  // Stream the retry
  const result = streamText({
    model,
    system: roleConfig.systemPrompt,
    messages: conversationHistory,
    onFinish: async ({ text }) => {
      // Save new version
      await supabase.from('messages').insert({
        workspace_id: workspaceId,
        role_slug: roleSlug,
        sender: 'assistant',
        content: text,
        chat_id: chatId,
        model_used: modelSlug,
        version_group_id: versionGroupId,
        version_number: currentMaxVersion + 1,
        is_active_version: true,
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
