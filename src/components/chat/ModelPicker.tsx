"use client";

import { useState, useEffect } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export interface AIModel {
  id: string;
  slug: string;
  display_name: string;
  provider: string;
  category: string;
  cost_tier: string;
}

const FALLBACK_MODELS: AIModel[] = [
  { id: "1", slug: "anthropic/claude-sonnet-4.6", display_name: "Claude Sonnet 4", provider: "Anthropic", category: "reasoning", cost_tier: "standard" },
  { id: "2", slug: "anthropic/claude-opus-4", display_name: "Claude Opus 4", provider: "Anthropic", category: "complex", cost_tier: "premium" },
  { id: "3", slug: "openai/gpt-4o", display_name: "GPT-4o", provider: "OpenAI", category: "general", cost_tier: "standard" },
  { id: "4", slug: "openai/gpt-4o-mini", display_name: "GPT-4o Mini", provider: "OpenAI", category: "fast", cost_tier: "free" },
  { id: "5", slug: "xai/grok-3", display_name: "Grok 3", provider: "xAI", category: "general", cost_tier: "standard" },
  { id: "6", slug: "google/gemini-2.5-flash", display_name: "Gemini 2.5 Flash", provider: "Google", category: "fast", cost_tier: "free" },
  { id: "7", slug: "perplexity/sonar-reasoning", display_name: "Perplexity Sonar", provider: "Perplexity", category: "search", cost_tier: "standard" },
];

export function ModelPicker({
  selectedModelId,
  onModelSelect,
  defaultModelName,
}: {
  selectedModelId?: string | null;
  onModelSelect: (modelId: string | null) => void;
  defaultModelName: string;
}) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          setModels(data && data.length > 0 ? data : FALLBACK_MODELS);
        } else {
          setModels(FALLBACK_MODELS);
        }
      } catch {
        setModels(FALLBACK_MODELS);
      } finally {
        setLoading(false);
      }
    }
    fetchModels();
  }, []);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  const selectedModel = models.find(m => m.slug === selectedModelId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div 
          className="inline-flex items-center h-9 px-3 gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 font-medium hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0 max-w-[150px] sm:max-w-none cursor-pointer"
        >
          {selectedModel ? (
            <>
              <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
              <span className="truncate">{selectedModel.display_name}</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">1x</Badge>
            </>
          ) : (
            <>
              <span className="truncate">{defaultModelName}</span>
              <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-2 rounded-2xl border-zinc-200 dark:border-zinc-800">
        <ScrollArea className="h-[300px] pr-2">
          
          <DropdownMenuItem
            onClick={() => onModelSelect(null)}
            className={`rounded-xl mb-2 flex items-center justify-between cursor-pointer ${!selectedModel ? "bg-zinc-100 dark:bg-zinc-800/50" : ""}`}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Default Persona Model</span>
              <span className="text-xs text-zinc-500">{defaultModelName}</span>
            </div>
            {!selectedModel && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          </DropdownMenuItem>

          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <div key={provider} className="mb-4 last:mb-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1 mt-2">
                {provider}
              </div>
              <div className="space-y-0.5">
                {providerModels.map(model => (
                  <DropdownMenuItem
                    key={model.id}
                    onClick={() => onModelSelect(model.slug)}
                    className={`rounded-xl flex items-center justify-between py-1.5 cursor-pointer ${selectedModel?.slug === model.slug ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.display_name}</span>
                      {model.cost_tier === "premium" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Premium" />
                      )}
                      {model.cost_tier === "free" && (
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400" title="Free/Fast" />
                      )}
                    </div>
                    {selectedModel?.slug === model.slug && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>
          ))}

        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
