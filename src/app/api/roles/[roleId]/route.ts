import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  const allowed: Record<string, unknown> = {};

  const editableFields = ['name', 'title', 'description', 'personality', 'challenge_rules', 'color', 'icon', 'artifact_type', 'is_active', 'sort_order'];
  for (const field of editableFields) {
    if (updates[field] !== undefined) {
      allowed[field] = updates[field];
    }
  }

  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('custom_roles')
    .update(allowed)
    .eq('id', roleId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('custom_roles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', roleId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
