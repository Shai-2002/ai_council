import { Role } from "@/types";
import * as LucideIcons from "lucide-react";

function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function RoleHeader({ role }: { role: Role }) {
  return (
    <div className={`w-full border-b px-6 py-4 flex items-center gap-4 ${role.bgLight} ${role.border}`}>
      <div className={`p-2.5 rounded-xl ${role.bgDark} text-white shadow-sm flex items-center justify-center`}>
        <IconByName name={role.icon} className="h-6 w-6" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h1 className={`text-xl font-bold ${role.text}`}>{role.name}</h1>
          <span className={`text-sm font-medium px-2 py-0.5 rounded-full border ${role.border} ${role.text} bg-white/50 dark:bg-zinc-950/50`}>
            {role.title}
          </span>
        </div>
        <p className={`text-sm opacity-80 ${role.text}`}>{role.description}</p>
      </div>
    </div>
  );
}
