import { CheckCircle2, MessageSquare, Users } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-indigo-100 via-indigo-600 to-indigo-100 dark:from-indigo-900/20 dark:via-indigo-600/50 dark:to-indigo-900/20" />
          
          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-950 shadow-xl flex items-center justify-center mb-6 text-indigo-600">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Pick a Role</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Consult your CFO on pricing, or debate strategy with your CEO. Choose the specialized executive for your current problem.
            </p>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-950 shadow-xl flex items-center justify-center mb-6 text-indigo-600">
              <MessageSquare className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Get Challenged</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Present your idea. They won&apos;t just agree. They will push back, ask hard questions, and strengthen your logic.
            </p>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-white dark:bg-zinc-900 border-4 border-zinc-50 dark:border-zinc-950 shadow-xl flex items-center justify-center mb-6 text-indigo-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Decide Confidently</h3>
            <p className="text-zinc-600 dark:text-zinc-400">
              Turn conversations into structured, formal artifacts: PRDs, financial models, execution plans. Real deliverables.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
