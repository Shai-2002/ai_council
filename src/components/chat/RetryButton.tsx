"use client";

import { useState, useEffect } from "react";
import { RotateCw, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AIModel } from "./ModelPicker";

interface RetryButtonProps {
  messageId: string;
  onRetry: (messageId: string, modelOverride?: string) => void;
}

const FALLBACK_MODELS: AIModel[] = [
  { id: "1", slug: "anthropic/claude-sonnet-4.6", display_name: "Claude Sonnet 4", provider: "Anthropic", category: "reasoning", cost_tier: "standard" },
  { id: "3", slug: "openai/gpt-4o", display_name: "GPT-4o", provider: "OpenAI", category: "general", cost_tier: "standard" },
  { id: "5", slug: "xai/grok-3", display_name: "Grok 3", provider: "xAI", category: "general", cost_tier: "standard" },
  { id: "6", slug: "google/gemini-2.5-flash", display_name: "Gemini 2.5 Flash", provider: "Google", category: "fast", cost_tier: "free" },
];

export function RetryButton({ messageId, onRetry }: RetryButtonProps) {
  const [models, setModels] = useState<AIModel[]>([]);

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
      }
    }
    fetchModels();
  }, []);

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onRetry(messageId)}
        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-l-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <RotateCw className="h-3 w-3" />
        <span>Retry</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none flex items-center justify-center px-1.5 py-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors rounded-r-md hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
          <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px] p-2 rounded-2xl border-zinc-200 dark:border-zinc-800">
          <div className="px-2 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">Retry with model...</div>
          <ScrollArea className="h-[250px] pr-2 mt-1">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider} className="mb-3 last:mb-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1">
                  {provider}
                </div>
                <div className="space-y-0.5">
                  {providerModels.map(model => (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() => onRetry(messageId, model.slug)}
                      className="rounded-xl flex items-center justify-between py-1.5 cursor-pointer"
                    >
                      <span className="text-sm font-medium">{model.display_name}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
