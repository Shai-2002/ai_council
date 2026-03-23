import { MessageSquare, Zap, SendHorizontal } from "lucide-react";

export function MeetingPreview() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950 -z-10" />
      
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
          <MessageSquare className="h-4 w-4" />
          <span>Cross-functional alignment</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
          The Meeting Room — <br className="hidden md:block" />
          where executives debate your decisions
        </h2>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
          Tag one role or all five. They&apos;ll challenge each other, flag conflicts, and push your thinking further than any solo brainstorm.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative group">
        
        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

        {/* Chat Window */}
        <div className="relative rounded-2xl md:rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col h-[500px]">
          
          {/* Header */}
          <div className="h-14 border-b border-zinc-800/50 bg-zinc-950/50 flex items-center px-6 justify-between shrink-0">
            <div className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Q3 Planning Synch
            </div>
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-zinc-900 text-[10px] font-bold flex items-center justify-center">A</div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-zinc-900 text-[10px] font-bold flex items-center justify-center">D</div>
              <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-zinc-900 text-[10px] font-bold flex items-center justify-center">M</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar text-left text-zinc-300">
            
            <div className="flex gap-4 max-w-[90%]">
              <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                A
              </div>
              <div className="flex flex-col gap-1 items-start min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-100">Aria</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-800/50">CEO</span>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-5 py-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  <p className="text-sm md:text-base leading-relaxed">
                    We need to shift $50k from Q3 performance marketing to product development. This is a strategic bet on the new onboarding flow. <span className="text-amber-400 font-medium bg-amber-900/20 px-1 rounded">@maya</span> can we absorb this hit?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-[90%] self-end flex-row-reverse">
              <div className="h-10 w-10 shrink-0 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
                M
              </div>
              <div className="flex flex-col gap-1 items-end min-w-0">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <span className="font-semibold text-zinc-100">Maya</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded border border-amber-800/50">CFO</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full relative overflow-hidden ml-2">
                    <span className="absolute inset-0 bg-red-400/10 animate-pulse" />
                    <Zap className="h-3 w-3 fill-current" /> CONFLICT
                  </span>
                </div>
                <div className="bg-zinc-800/50 border border-red-900/30 rounded-2xl rounded-tr-sm px-5 py-4 relative overflow-hidden max-w-lg text-right">
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-600" />
                  <p className="text-sm md:text-base leading-relaxed">
                    Absolutely not. Pulling $50k drastically misses our Q3 revenue targets. You are assuming the new onboarding flow will instantly convert at 2x. 
                    <br/><br/>
                    I need <span className="text-violet-400 font-medium bg-violet-900/20 px-1 rounded">@kai</span> to validate that conversion lift before I approve the budget shift.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-[90%]">
              <div className="h-10 w-10 shrink-0 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shadow-sm">
                K
              </div>
              <div className="flex flex-col gap-1 items-start min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-100">Kai</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-900/30 px-1.5 py-0.5 rounded border border-violet-800/50">Product Lead</span>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-5 py-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />
                  <p className="text-sm md:text-base leading-relaxed mb-3">
                    Maya is right. Based on existing metrics, we project only a 1.2x lift in month one. The $50k bet is too risky without a phased rollout.
                  </p>
                  <div className="inline-block border border-zinc-700 bg-zinc-900/50 rounded p-3 mt-2 shadow-inner">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Proposal</div>
                    <div className="text-sm text-zinc-300">Phase 1 validation: shift $10k, unblock Dev team, assess M1 metrics.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Area */}
          <div className="border-t border-zinc-800/50 bg-zinc-900/80 p-4 shrink-0 flex flex-col gap-3">
            <div className="flex gap-2 px-2 overflow-x-auto custom-scrollbar pb-1">
              <button className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-300 transition-colors">
                💬 Ask <span className="text-indigo-400">@aria</span> to approve Phase 1
              </button>
              <button className="whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-300 transition-colors">
                📊 Request financial model from <span className="text-amber-400">@maya</span>
              </button>
            </div>
            <div className="relative">
              <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-12 flex items-center px-4 shadow-inner">
                <span className="text-zinc-500 text-sm flex-1">Tag executives with @...</span>
                <div className="h-8 w-8 rounded-lg bg-indigo-600/50 text-indigo-300 flex items-center justify-center shrink-0">
                  <SendHorizontal className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
