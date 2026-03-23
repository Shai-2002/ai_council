'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useWorkspace } from './useWorkspace';
import { ROLES } from '@/lib/roles-config';
import { COLOR_CLASSES } from '@/lib/role-templates';
import type { Role } from '@/types';

interface RolesContextValue {
  roles: Role[];
  rolesMap: Record<string, Role>;
  getRoleBySlug: (slug: string) => Role | undefined;
  refreshRoles: () => Promise<void>;
  loading: boolean;
}

const defaultRoles = Object.values(ROLES);
const defaultMap = ROLES as Record<string, Role>;

const RolesContext = createContext<RolesContextValue>({
  roles: defaultRoles,
  rolesMap: defaultMap,
  getRoleBySlug: (slug) => defaultMap[slug],
  refreshRoles: async () => {},
  loading: true,
});

export function RolesProvider({ children }: { children: React.ReactNode }) {
  const { workspaceId } = useWorkspace();
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [rolesMap, setRolesMap] = useState<Record<string, Role>>(defaultMap);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const res = await fetch(`/api/roles?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();

      if (data.roles && data.roles.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const converted: Role[] = data.roles
          .filter((r: { is_active: boolean }) => r.is_active)
          .map((r: { slug: string; name: string; title: string; description: string; icon: string; color: string; artifact_type: string }) => {
            const colors = COLOR_CLASSES[r.color] || COLOR_CLASSES.indigo;
            return {
              slug: r.slug as Role['slug'],
              name: r.name,
              title: r.title,
              description: r.description,
              icon: r.icon || 'User',
              color: r.color,
              bgLight: colors.bgLight,
              bgDark: colors.bgDark,
              text: colors.text,
              border: colors.border,
              artifactType: r.artifact_type || 'Analysis',
            } as Role;
          });

        setRoles(converted);

        const map: Record<string, Role> = {};
        converted.forEach(r => { map[r.slug] = r; });
        setRolesMap(map);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      // Keep defaults on error
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const getRoleBySlug = useCallback((slug: string): Role | undefined => {
    return rolesMap[slug] || defaultMap[slug];
  }, [rolesMap]);

  return (
    <RolesContext.Provider value={{ roles, rolesMap, getRoleBySlug, refreshRoles: fetchRoles, loading }}>
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  return useContext(RolesContext);
}
