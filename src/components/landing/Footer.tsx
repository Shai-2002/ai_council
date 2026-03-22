import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Layers className="h-6 w-6 text-indigo-600" />
          <span>AI Roles Workspace</span>
        </div>
        
        <div className="flex gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="hover:text-indigo-600 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-indigo-600 transition-colors">
            Sign up
          </Link>
        </div>
        
        <div className="text-sm text-zinc-500">
          © {new Date().getFullYear()} AI Roles Workspace. Build better businesses.
        </div>
      </div>
    </footer>
  );
}
