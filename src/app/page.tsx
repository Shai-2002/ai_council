import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoleShowcase } from "@/components/landing/RoleShowcase";
import { MeetingPreview } from "@/components/landing/MeetingPreview";
import { Footer } from "@/components/landing/Footer";
import { PricingCards } from "@/components/shared/PricingCards";
import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Layers className="h-6 w-6 text-indigo-600" />
          <span className="hidden sm:inline-block">AI Roles Workspace</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90">
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 mt-16">
        <Hero />
        <HowItWorks />
        <RoleShowcase />
        <MeetingPreview />
        
        {/* Pricing Section inline */}
        <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Upgrade your council when your business is ready to grow. No hidden fees.
            </p>
          </div>
          <PricingCards />
        </section>
      </main>

      <Footer />
    </div>
  );
}
