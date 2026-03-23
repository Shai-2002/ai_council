import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background Mesh/Texture */}
      <div className="absolute inset-0 bg-white dark:bg-zinc-950 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-white to-white dark:from-indigo-900/20 dark:via-zinc-950 dark:to-zinc-950" />
        <div className="absolute top-0 right-0 -mr-40 mt-10 w-96 h-96 bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 left-0 -ml-40 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col items-center text-center z-10 relative">
        
        {/* Social Proof Capsule */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 animate-fade-in">
          <Users className="h-4 w-4" />
          <span>Join 200+ solopreneurs making better decisions</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 font-sans">
          Your boardroom. <br className="hidden md:block" />
          Five executives. <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Zero yes-men.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Stop making decisions alone. AI Roles Workspace gives you a dedicated COO, CFO, Product Lead, and Marketing Lead to challenge your thinking and output structured action plans.
        </p>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white w-full shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]">
              Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 w-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Mock Chat Visual */}
        <div className="w-full max-w-4xl mx-auto rounded-2xl md:rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Mac window header */}
          <div className="h-12 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white dark:bg-zinc-800/50 px-3 py-1 rounded-md shadow-sm">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              The Council Room
            </div>
          </div>
          
          {/* Chat Body */}
          <div className="p-4 md:p-8 flex flex-col gap-6 text-left">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] sm:max-w-md shadow-sm">
                <p className="text-sm md:text-base leading-relaxed">
                  <span className="bg-indigo-500/50 px-1.5 py-0.5 rounded text-indigo-100 font-medium mr-1.5">@aria</span>
                  Thinking of raising prices by 20% next month. What should we focus on?
                </p>
              </div>
            </div>

            {/* Assistant Message (Aria) */}
            <div className="flex gap-4 max-w-[90%] sm:max-w-2xl">
              <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm ring-4 ring-white dark:ring-zinc-950">
                A
              </div>
              <div className="flex flex-col gap-1 items-start min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Aria</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">CEO</span>
                  <span className="text-xs text-zinc-400">Just now</span>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                  <p className="text-sm md:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                    If you strictly raise prices by 20% without adding perceived value, you will fracture your existing user base. We need a grandfathering strategy for loyal cohorts.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded text-xs">
                      Asking <span className="font-medium text-amber-600 dark:text-amber-500">@maya</span> for churn projections...
                    </span>
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
