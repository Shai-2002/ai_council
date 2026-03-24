import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/supabase/auth-helpers';

export async function PATCH(req: Request) {
  const { supabase, user } = await getAuthenticatedClient();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { versionGroupId, activeVersion } = await req.json();

  if (!versionGroupId || !activeVersion) {
    return NextResponse.json({ error: 'versionGroupId and activeVersion required' }, { status: 400 });
  }

  // Deactivate all versions in the group
  await supabase
    .from('messages')
    .update({ is_active_version: false })
    .eq('version_group_id', versionGroupId);

  // Activate the selected version
  const { data, error } = await supabase
    .from('messages')
    .update({ is_active_version: true })
    .eq('version_group_id', versionGroupId)
    .eq('version_number', activeVersion)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
