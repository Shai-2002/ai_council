import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 font-sans">
        Your boardroom. <br className="hidden md:block" />
        Five executives. <span className="text-indigo-600">Zero yes-men.</span>
      </h1>
      <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-3xl mx-auto leading-relaxed">
        Stop making decisions alone. AI Roles Workspace gives you a dedicated COO, CFO, Product Lead, and Marketing Lead to challenge your thinking and output structured action plans.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/signup">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
            Start Free Today
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 w-full sm:w-auto hover:bg-zinc-50 dark:hover:bg-zinc-900">
            See How It Works
          </Button>
        </Link>
      </div>
    </section>
  );
}
