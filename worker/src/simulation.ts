import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { supabase } from './supabase';
import { ROLE_CONFIGS } from './roles';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

interface SimulationJob {
  id: string;
  chat_id: string;
  workspace_id: string;
  trigger_message: string;
  tagged_roles: string[];
  instructions: Record<string, string> | null;
}

export async function runSimulation(job: SimulationJob): Promise<void> {
  const { id, chat_id, workspace_id, trigger_message, tagged_roles } = job;

  // Mark as running
  await supabase.from('simulation_jobs').update({
    status: 'running',
    started_at: new Date().toISOString(),
  }).eq('id', id);

  // Get workspace context
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('company_context')
    .eq('id', workspace_id)
    .single();

  // Get recent artifacts for cross-role context
  const { data: artifacts } = await supabase
    .from('artifacts')
    .select('role_slug, title')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: false })
    .limit(5);

  const artifactContext = artifacts?.map(a =>
    `${(a.role_slug || '').toUpperCase()}: ${a.title}`
  ).join('\n') || '';

  // Get conversation history from this chat
  const { data: history } = await supabase
    .from('messages')
    .select('role_slug, sender, content')
    .eq('chat_id', chat_id)
    .order('created_at', { ascending: false })
    .limit(20);

  const conversationHistory = (history || []).reverse().map(m =>
    `${m.sender === 'user' ? 'User' : (m.role_slug || 'Unknown').toUpperCase()}: ${m.content?.slice(0, 500)}`
  ).join('\n');

  // Get file context for this chat
  const { data: chatFiles } = await supabase
    .from('files')
    .select('name, extracted_text')
    .eq('chat_id', chat_id)
    .not('extracted_text', 'is', null)
    .limit(3);

  const fileContext = chatFiles?.map(f =>
    `--- ${f.name} ---\n${f.extracted_text?.slice(0, 1500)}\n---`
  ).join('\n\n') || '';

  // Track all responses for cross-role awareness during simulation
  const simulationResponses: { role: string; content: string }[] = [];

  // Run each role sequentially
  for (const roleSlug of tagged_roles) {
    const config = ROLE_CONFIGS[roleSlug];
    if (!config) continue;

    // Build simulation-specific prompt
    const systemPrompt = [
      config.personality,
      `\nYou are in a SIMULATION MEETING. The user asked all executives to discuss and challenge each other.`,
      `Original request: "${trigger_message}"`,
      workspace?.company_context && Object.keys(workspace.company_context).length > 0
        ? `\nCOMPANY CONTEXT:\n${JSON.stringify(workspace.company_context)}`
        : '',
      conversationHistory ? `\nCONVERSATION HISTORY:\n${conversationHistory}` : '',
      artifactContext ? `\nRECENT DECISIONS:\n${artifactContext}` : '',
      fileContext ? `\nFILES:\n${fileContext}` : '',
      simulationResponses.length > 0
        ? `\nOTHER EXECUTIVES HAVE ALREADY RESPONDED IN THIS SIMULATION:\n${
            simulationResponses.map(r => `${r.role.toUpperCase()}: ${r.content.slice(0, 800)}`).join('\n\n')
          }\n\nYou may agree, disagree, or build on their points. Be direct.`
        : '',
      config.challengeRules,
      '\nKeep your response focused and substantive. Other executives will respond after you. If you disagree with what anyone said, say so directly and explain why.',
    ].filter(Boolean).join('\n\n');

    try {
      const result = await generateText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: openrouter('anthropic/claude-sonnet-4.6') as any,
        system: systemPrompt,
        messages: [{ role: 'user' as const, content: trigger_message }],
        maxOutputTokens: 2000,
      });

      const responseText = result.text;

      // Save to messages table (triggers Realtime broadcast automatically)
      await supabase.from('messages').insert({
        chat_id,
        workspace_id,
        role_slug: roleSlug,
        sender: 'assistant',
        content: responseText,
      });

      // Track for cross-role awareness
      simulationResponses.push({ role: roleSlug, content: responseText });

      console.log(`[Simulation ${id}] ${config.name} responded (${responseText.length} chars)`);

    } catch (error) {
      console.error(`[Simulation ${id}] ${config.name} failed:`, error);

      // Save error message
      await supabase.from('messages').insert({
        chat_id,
        workspace_id,
        role_slug: roleSlug,
        sender: 'assistant',
        content: `[${config.name} encountered an error during simulation]`,
      });
    }
  }

  // Mark simulation as completed
  await supabase.from('simulation_jobs').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', id);

  console.log(`[Simulation ${id}] COMPLETE — ${simulationResponses.length} roles responded`);
}
