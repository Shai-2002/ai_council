"use client";

import { useState, useEffect } from "react";
import { Search, Circle } from "lucide-react";
import { ModelDropdown, type ModelOption } from "./ModelDropdown";
import { useRoles } from "@/lib/hooks/useRoles";
import { type Role } from "@/types";

interface ModelsTabProps {
  mode: 'single' | 'meeting' | 'direct';
  currentRoleSlug?: string;
  workspaceId: string;
}

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';

export function ModelsTab({ mode, currentRoleSlug, workspaceId }: ModelsTabProps) {
  const { roles, rolesMap } = useRoles();
  const [models, setModels] = useState<ModelOption[]>([]);
  const [overrideModel, setOverrideModel] = useState<string>("default");
  const [roleModels, setRoleModels] = useState<Record<string, string>>({});

  // Fetch real models from API
  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        const list = (Array.isArray(data) ? data : data.models || []).map((m: Record<string, string>) => ({
          slug: m.slug,
          display_name: m.display_name,
          provider: m.provider,
          cost_tier: m.cost_tier,
        }));
        setModels(list);
      })
      .catch(console.error);
  }, []);

  // Initialize roleModels from custom_roles default_model
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/roles?workspaceId=${workspaceId}`)
      .then(r => r.json())
      .then(data => {
        const initial: Record<string, string> = {};
        (data.roles || []).forEach((r: { slug: string; default_model?: string; id?: string }) => {
          if (r.default_model) initial[r.slug] = r.default_model;
        });
        setRoleModels(initial);
      })
      .catch(console.error);
  }, [workspaceId]);

  const handleUpdateRoleModel = async (roleSlug: string, modelSlug: string) => {
    setRoleModels(prev => ({ ...prev, [roleSlug]: modelSlug }));

    // Find the role's DB id for the API call
    try {
      const rolesRes = await fetch(`/api/roles?workspaceId=${workspaceId}`);
      const rolesData = await rolesRes.json();
      const dbRole = (rolesData.roles || []).find((r: { slug: string }) => r.slug === roleSlug);
      if (dbRole?.id) {
        await fetch(`/api/roles/${dbRole.id}/model`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelSlug }),
        });
      }
    } catch (e) {
      console.error('Failed to update model:', e);
    }
  };

  if (mode === 'single' && currentRoleSlug) {
    const role = rolesMap[currentRoleSlug];
    const roleModel = roleModels[currentRoleSlug] || DEFAULT_MODEL;

    return (
      <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Current Persona</h4>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-2.5 w-2.5 rounded-full ${role?.bgDark || 'bg-zinc-400'}`} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{role?.name} &middot; {role?.title}</span>
              </div>
              <ModelDropdown
                models={models}
                currentModel={roleModel}
                onSelect={(val) => handleUpdateRoleModel(currentRoleSlug, val)}
              />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">One-time Override</h4>
            <p className="text-xs text-zinc-500 mb-2">Send next message with:</p>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 shadow-sm space-y-1">
              <div
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => setOverrideModel("default")}
              >
                {overrideModel === 'default' ? <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600" /> : <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />}
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Default (Current)</span>
              </div>
              {models.slice(0, 5).map(m => (
                <div
                  key={m.slug}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  onClick={() => setOverrideModel(m.slug)}
                >
                  {overrideModel === m.slug ? <Circle className="h-4 w-4 fill-indigo-600 text-indigo-600" /> : <Circle className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />}
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{m.display_name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm mb-1">
              <Search className="h-4 w-4" /> Research: Active
            </div>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
              Perplexity Reasoning Pro powers internet research for all chats automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'meeting') {
    return (
      <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Persona Models</h4>
            <div className="space-y-4">
              {roles.map((role: Role) => (
                <div key={role.slug} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${role.bgDark}`} />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{role.name} ({role.title})</span>
                  </div>
                  <ModelDropdown
                    models={models}
                    currentModel={roleModels[role.slug] || DEFAULT_MODEL}
                    onSelect={(val) => handleUpdateRoleModel(role.slug, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-medium text-sm mb-1">
              <Search className="h-4 w-4" /> Research: Active
            </div>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
              Shared research context for all roles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'direct'
  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Hint</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            @mention any model in the chat: <br /> <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">@claude</code>, <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">@gpt</code>, etc.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available Models</h4>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {models.map((m, i) => (
              <div key={m.slug} className={`flex items-center justify-between p-3 ${i !== models.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${m.provider === 'Anthropic' ? 'bg-purple-500' : m.provider === 'OpenAI' ? 'bg-emerald-500' : m.provider === 'xAI' ? 'bg-blue-500' : m.provider === 'Google' ? 'bg-yellow-500' : m.provider === 'Perplexity' ? 'bg-teal-500' : 'bg-orange-500'}`} />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.display_name}</span>
                </div>
                <span className="text-[10px] text-zinc-400 uppercase">{m.cost_tier}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
