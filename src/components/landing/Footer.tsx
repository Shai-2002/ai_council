import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pt-16 pb-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="flex flex-col md:flex-row justify-between w-full gap-10 mb-16">
          <div className="flex flex-col max-w-sm">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4 group inline-block w-max">
              <Layers className="h-7 w-7 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span>AI Roles Workspace</span>
            </Link>
            <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Built for solopreneurs who refuse to make decisions alone. Access five dedicated AI executives focused on driving tangible outcomes.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase text-sm">Product</h4>
            <Link href="/pricing" className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Pricing</Link>
            <Link href="#how-it-works" className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">How it works</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight uppercase text-sm">Company</h4>
            <Link href="#" className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">About Us</Link>
            <Link href="#" className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Contact</Link>
            <Link href="#" className="text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Privacy Policy</Link>
          </div>
        </div>
        
        <div className="w-full pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-zinc-500">
            © {new Date().getFullYear()} AI Roles Workspace. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
