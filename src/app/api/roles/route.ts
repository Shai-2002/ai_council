import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';
import { ROLE_CONFIGS } from '@/lib/ai/roles';
import { ROLE_TEMPLATES } from '@/lib/role-templates';
import type { RoleSlug } from '@/types';

export async function GET(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });

  const { data: customRoles, error } = await supabase
    .from('custom_roles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-provision the 5 defaults if none exist
  if (!customRoles || customRoles.length === 0) {
    const defaultSlugs: RoleSlug[] = ['ceo', 'coo', 'cfo', 'product', 'marketing'];
    const defaults = defaultSlugs.map((slug, i) => {
      const config = ROLE_CONFIGS[slug];
      return {
        workspace_id: workspaceId,
        slug,
        name: config.name,
        title: config.title,
        description: config.systemPrompt.substring(0, 80) + '...',
        personality: config.systemPrompt,
        challenge_rules: '',
        color: slug === 'ceo' ? 'indigo' : slug === 'coo' ? 'emerald' : slug === 'cfo' ? 'amber' : slug === 'product' ? 'violet' : 'rose',
        icon: slug === 'ceo' ? 'Crown' : slug === 'coo' ? 'ListChecks' : slug === 'cfo' ? 'IndianRupee' : slug === 'product' ? 'Layers' : 'Megaphone',
        artifact_type: config.artifactType,
        is_default: true,
        is_active: true,
        sort_order: i,
      };
    });

    const { data: created, error: createError } = await supabase
      .from('custom_roles')
      .insert(defaults)
      .select();

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    return NextResponse.json({ roles: created, templates: ROLE_TEMPLATES });
  }

  return NextResponse.json({ roles: customRoles, templates: ROLE_TEMPLATES });
}

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { workspaceId, name, title, description, personality, challengeRules, color, icon, artifactType, templateSlug } = body;

  if (!workspaceId || !name || !title) {
    return NextResponse.json({ error: 'workspaceId, name, and title required' }, { status: 400 });
  }

  let finalPersonality = personality || '';
  let finalDescription = description || '';
  let finalColor = color || 'indigo';
  let finalIcon = icon || 'User';
  let finalArtifactType = artifactType || 'Analysis';
  let finalChallengeRules = challengeRules || '';

  if (templateSlug) {
    const template = ROLE_TEMPLATES.find(t => t.slug === templateSlug);
    if (template) {
      finalPersonality = personality || template.personality;
      finalDescription = description || template.description;
      finalColor = color || template.color;
      finalIcon = icon || template.icon;
      finalArtifactType = artifactType || template.artifactType;
      finalChallengeRules = challengeRules || template.challengeRules;
    }
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30) + '_' + Date.now().toString(36);

  const { data: maxOrder } = await supabase
    .from('custom_roles')
    .select('sort_order')
    .eq('workspace_id', workspaceId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const { data: role, error } = await supabase
    .from('custom_roles')
    .insert({
      workspace_id: workspaceId,
      slug,
      name,
      title,
      description: finalDescription,
      personality: finalPersonality,
      challenge_rules: finalChallengeRules,
      color: finalColor,
      icon: finalIcon,
      artifact_type: finalArtifactType,
      is_default: false,
      is_active: true,
      sort_order: (maxOrder?.sort_order || 4) + 1,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(role);
}
