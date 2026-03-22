"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, FileText } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ROLES } from "@/lib/roles-config";
import { UserMenu } from "@/components/shared/UserMenu";
import { Separator } from "@/components/ui/separator";

// Helper to reliably render lucide icons by name
function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return <Layers className={className} />;
  return <Icon className={className} />;
}

export function RoleSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const handleNavClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Brand */}
      <div className="p-6">
        <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2 font-semibold text-lg">
          <Layers className="h-6 w-6 text-indigo-600" />
          <span>AI Roles</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 overflow-y-auto space-y-6">
        <div className="space-y-1">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">The Council</p>
          {Object.values(ROLES).map((role) => {
            const isActive = pathname === `/${role.slug}`;
            
            return (
              <Link
                key={role.slug}
                href={`/${role.slug}`}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? `${role.bgLight} ${role.text} font-medium` 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <div className={`p-1.5 rounded-md ${isActive ? role.bgDark + " text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
                  <IconByName name={role.icon} className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm truncate">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{role.name}</span>
                    {isActive && <div className={`h-1.5 w-1.5 rounded-full ${role.bgDark}`} />}
                  </div>
                  <div className="text-xs opacity-80 font-normal truncate">{role.title}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-2 text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Workspace</p>
          <Link
            href="/artifacts"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === "/artifacts" 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <div className={`p-1.5 rounded-md ${pathname === "/artifacts" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-sm">Artifacts</span>
          </Link>
          <Link
            href="/pricing"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === "/pricing" 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            <div className={`p-1.5 rounded-md ${pathname === "/pricing" ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white" : "bg-white dark:bg-zinc-800 shadow-sm border"}`}>
              <IconByName name="BadgeIndianRupee" className="h-4 w-4" />
            </div>
            <span className="text-sm">Pricing</span>
          </Link>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <UserMenu />
      </div>
    </div>
  );
}
