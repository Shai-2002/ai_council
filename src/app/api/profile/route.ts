import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function PATCH(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  const allowed: Record<string, unknown> = {};

  if (updates.theme !== undefined) allowed.theme = updates.theme;
  if (updates.full_name !== undefined) allowed.full_name = updates.full_name;

  const { data, error } = await supabase
    .from('profiles')
    .update(allowed)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
