"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { onLogout } from "@/lib/placeholder";
import { useWorkspace } from "@/lib/hooks/useWorkspace";
import { LogOut, Settings, User } from "lucide-react";

export function UserMenu() {
  const { profile, loading } = useWorkspace();

  const displayName = profile?.full_name || "User";
  const initials = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors text-left w-full outline-none">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={12}>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => { /* Profile page coming in a future wave */ }}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => { /* Settings page coming in a future wave */ }}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onLogout()} className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
