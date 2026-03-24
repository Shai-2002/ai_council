'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface WorkspaceContextValue {
  workspaceId: string | null;
  profile: { id: string; full_name: string | null; avatar_url: string | null; subscription_status: string } | null;
  loading: boolean;
  refreshKey: number;
  triggerRefresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  workspaceId: null,
  profile: null,
  loading: true,
  refreshKey: 0,
  triggerRefresh: () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<WorkspaceContextValue['profile']>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [profileResult, workspaceResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('workspaces').select('id').eq('owner_id', user.id).limit(1).single(),
      ]);

      if (profileResult.data) {
        setProfile({
          id: profileResult.data.id,
          full_name: profileResult.data.full_name,
          avatar_url: profileResult.data.avatar_url,
          subscription_status: profileResult.data.subscription_status,
        });
      }

      if (workspaceResult.data) {
        setWorkspaceId(workspaceResult.data.id);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, profile, loading, refreshKey, triggerRefresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
