"use client";

import { useState } from "react";
import { Search, Radio, Circle } from "lucide-react";
import { ModelDropdown, type ModelOption } from "./ModelDropdown";
import { useRoles } from "@/lib/hooks/useRoles";

interface ModelsTabProps {
  mode: 'single' | 'meeting' | 'direct';
  currentRoleSlug?: string;
  workspaceId: string;
}

const AVAILABLE_MODELS: ModelOption[] = [
  { slug: "claude-3-5-sonnet", display_name: "Claude Sonnet 3.5", provider: "Anthropic", cost_tier: "medium" },
  { slug: "claude-3-opus", display_name: "Claude Opus 3.0", provider: "Anthropic", cost_tier: "high" },
  { slug: "gpt-4o", display_name: "GPT-4o", provider: "OpenAI", cost_tier: "high" },
  { slug: "gpt-4o-mini", display_name: "GPT-4o Mini", provider: "OpenAI", cost_tier: "low" },
  { slug: "grok-core", display_name: "Grok Core", provider: "xAI", cost_tier: "medium" },
  { slug: "gemini-1.5-pro", display_name: "Gemini 1.5 Pro", provider: "Google", cost_tier: "medium" },
  { slug: "deepseek-v3", display_name: "DeepSeek V3", provider: "DeepSeek", cost_tier: "low" },
];

export function ModelsTab({ mode, currentRoleSlug }: ModelsTabProps) {
  const { rolesArray, rolesMap } = useRoles();
  const [overrideModel, setOverrideModel] = useState<string>("default");
  
  // Local state to simulate patched model assignments
  const [roleModels, setRoleModels] = useState<Record<string, string>>({});

  const handleUpdateRoleModel = (roleSlug: string, modelSlug: string) => {
    setRoleModels(prev => ({ ...prev, [roleSlug]: modelSlug }));
    console.log(`PATCH /api/roles/${roleSlug}/model -> ${modelSlug}`);
  };

  if (mode === 'single' && currentRoleSlug) {
    const role = rolesMap[currentRoleSlug];
    const roleModel = roleModels[currentRoleSlug] || "claude-3-5-sonnet";
    
    return (
      <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Current Persona */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Current Persona</h4>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-2.5 w-2.5 rounded-full ${role?.bgDark || 'bg-zinc-400'}`} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{role?.name} &middot; {role?.title}</span>
              </div>
              <ModelDropdown 
                models={AVAILABLE_MODELS} 
                currentModel={roleModel} 
                onSelect={(val) => handleUpdateRoleModel(currentRoleSlug, val)} 
              />
            </div>
          </div>

          {/* Override */}
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
              {AVAILABLE_MODELS.slice(0, 4).map(m => (
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

          {/* Research Active */}
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
              {rolesArray.map(role => (
                <div key={role.slug} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-2.5 w-2.5 rounded-full ${role.bgDark}`} />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{role.name} ({role.title})</span>
                  </div>
                  <ModelDropdown 
                    models={AVAILABLE_MODELS} 
                    currentModel={roleModels[role.slug] || "claude-3-5-sonnet"} 
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
  const directModel = roleModels['direct'] || "claude-3-5-sonnet";
  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950/50 overflow-y-auto">
      <div className="p-4 space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Default Model</h4>
          <ModelDropdown 
            models={AVAILABLE_MODELS} 
            currentModel={directModel} 
            onSelect={(val) => handleUpdateRoleModel('direct', val)} 
          />
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Hint</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            @mention any model in the chat: <br/> <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">@claude</code>, <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1 py-0.5 rounded">@gpt</code>, etc.
          </p>
        </div>

        <div>
           <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Available Models</h4>
           <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
             {AVAILABLE_MODELS.map((m, i) => (
               <div key={m.slug} className={`flex items-center justify-between p-3 ${i !== AVAILABLE_MODELS.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800/50' : ''}`}>
                 <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${m.provider === 'Anthropic' ? 'bg-purple-500' : m.provider === 'OpenAI' ? 'bg-emerald-500' : m.provider === 'xAI' ? 'bg-blue-500' : 'bg-orange-500'}`} />
                   <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{m.display_name}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
