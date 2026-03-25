import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { model } = await req.json();
  if (!model) return NextResponse.json({ error: 'model required' }, { status: 400 });

  const { data, error } = await supabase
    .from('custom_roles')
    .update({ default_model: model, updated_at: new Date().toISOString() })
    .eq('id', roleId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
