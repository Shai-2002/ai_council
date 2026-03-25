"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ModelOption {
  slug: string;
  display_name: string;
  provider: string;
  cost_tier: string;
}

interface ModelDropdownProps {
  currentModel: string;
  onSelect: (modelSlug: string) => void;
  models: ModelOption[];
}

export function ModelDropdown({ currentModel, onSelect, models }: ModelDropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedModel = models.find(m => m.slug === currentModel) || { display_name: currentModel };

  // Group by provider
  const grouped = models.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'anthropic': return 'bg-purple-500';
      case 'openai': return 'bg-emerald-500';
      case 'xai': return 'bg-blue-500';
      case 'google': return 'bg-orange-500';
      case 'perplexity': return 'bg-teal-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
          className="w-full flex items-center justify-between h-9 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-sm"
        >
          <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">
            {selectedModel.display_name}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" align="start">
        <ScrollArea className="h-[280px]">
          <div className="p-1">
            {Object.entries(grouped).map(([provider, providerModels]) => (
              <div key={provider} className="mb-2 last:mb-0">
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 capitalize">
                  {provider}
                </div>
                {providerModels.map((model) => (
                  <div
                    key={model.slug}
                    onClick={() => {
                      onSelect(model.slug);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${getProviderColor(model.provider)}`} />
                      <span className="truncate text-zinc-700 dark:text-zinc-300">
                        {model.display_name}
                      </span>
                    </div>
                    {currentModel === model.slug && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 ml-2 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
