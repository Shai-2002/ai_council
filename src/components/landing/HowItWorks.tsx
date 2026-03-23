import { FileText, Users, MessageSquare } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
            How your council operates
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Three simple steps to move from isolation to institutional-grade execution.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12 relative lg:px-4">
          
          {/* Step 1 */}
          <div className="relative group">
            <div className="h-64 mb-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-md">
              <div className="flex -space-x-4 items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-indigo-600 flex items-center justify-center text-white font-bold text-lg z-50 transform hover:-translate-y-2 transition-transform">A</div>
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-emerald-600 flex items-center justify-center text-white font-bold text-lg z-40 transform hover:-translate-y-2 transition-transform">D</div>
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-amber-600 flex items-center justify-center text-white font-bold text-lg z-30 transform hover:-translate-y-2 transition-transform">M</div>
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-violet-600 flex items-center justify-center text-white font-bold text-lg z-20 transform hover:-translate-y-2 transition-transform">K</div>
                <div className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-rose-600 flex items-center justify-center text-white font-bold text-lg z-10 transform hover:-translate-y-2 transition-transform">P</div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Pick an Executive</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Summon the exact expertise you need. Don&apos;t ask a generic chatbox about finances; ask your dedicated CFO.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="h-64 mb-8 bg-zinc-900 dark:bg-zinc-950 rounded-3xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col p-4 transition-all duration-300 group-hover:shadow-md">
              <div className="flex gap-3 mb-4 w-4/5 pt-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0 text-white font-bold flex items-center justify-center text-xs">Me</div>
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tl-sm text-[11px] sm:text-xs">
                  I&apos;m thinking we triple the ad spend based on last week&apos;s ROAS.
                </div>
              </div>
              <div className="flex gap-3 self-end w-[85%] flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-amber-600 shrink-0 text-white font-bold flex items-center justify-center text-xs">M</div>
                <div className="bg-zinc-800 border border-zinc-700 text-zinc-300 p-3 rounded-2xl rounded-tr-sm text-[11px] sm:text-xs text-right">
                  <strong>Conflict detected:</strong> Your conversion assumption is 3x the industry average. Last week was a holiday spike. Show me your baseline cohort retention or I vote against this.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Get Challenged</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  They are designed to push back. They will poke holes in your thesis, ask hard questions, and strengthen your logic.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="h-64 mb-8 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden p-6 relative flex flex-col items-center justify-center transition-all duration-300 group-hover:shadow-md">
              <div className="w-11/12 bg-white dark:bg-zinc-950 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-4 transform rotate-1 scale-105">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200">Decision Memo</div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-2 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                  <div className="h-2 w-5/6 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-bold rounded">FINANCIAL MODEL</span>
                  <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[9px] font-bold rounded">APPROVED</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Generate Structured Artifacts</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Conversations don&apos;t just end. They formalize into PRDs, GTM models, and Strategy Memos you can actually use.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
