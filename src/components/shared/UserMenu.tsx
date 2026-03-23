"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { onLogout } from "@/lib/placeholder";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { LogOut, Settings } from "lucide-react";

export function UserMenu() {
  const { profile, loading } = useWorkspace();
  const router = useRouter();

  const displayName = profile?.full_name || "User";
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex flex-col gap-1 px-2">
      {/* User info — click to go to settings */}
      <button
        onClick={() => router.push('/settings')}
        className="flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors text-left w-full"
      >
        <Avatar className="h-9 w-9 bg-zinc-200 dark:bg-zinc-800 text-sm font-medium">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {loading ? "Loading..." : displayName}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {profile?.subscription_status === 'active' ? 'Pro' : 'Free'} plan
          </p>
        </div>
        <Settings className="h-4 w-4 text-zinc-400 shrink-0" />
      </button>

      {/* Logout button — always visible */}
      <button
        onClick={() => onLogout()}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span>Log out</span>
      </button>
    </div>
  );
}
