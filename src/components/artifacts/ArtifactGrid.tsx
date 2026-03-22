import { Artifact } from "@/types";
import { ROLES } from "@/lib/roles-config";
import * as LucideIcons from "lucide-react";

function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function ArtifactGrid({ artifacts, onSelect }: { artifacts: Artifact[], onSelect: (id: string) => void }) {
  // Group by role_slug
  const grouped = artifacts.reduce((acc, artifact) => {
    if (!acc[artifact.roleSlug]) {
      acc[artifact.roleSlug] = [];
    }
    acc[artifact.roleSlug].push(artifact);
    return acc;
  }, {} as Record<string, Artifact[]>);

  return (
    <div className="space-y-10 p-6">
      {Object.entries(grouped).map(([roleSlug, roleArtifacts]) => {
        const role = ROLES[roleSlug];
        if (!role) return null;

        return (
          <div key={roleSlug} className="space-y-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${role.text}`}>
              <IconByName name={role.icon} className="h-5 w-5" />
              {role.name}&apos;s Artifacts
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roleArtifacts.map((artifact) => (
                <div 
                  key={artifact.id}
                  onClick={() => onSelect(artifact.id)}
                  className={`cursor-pointer group rounded-xl border ${role.border} bg-white dark:bg-zinc-950 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${role.bgLight} ${role.text}`}>
                      <IconByName name={role.icon} className="h-4 w-4" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${
                      artifact.status === "final" 
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                        : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                    }`}>
                      {artifact.status.charAt(0).toUpperCase() + artifact.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${role.text}`}>
                      {artifact.artifactType}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-4 flex-1 group-hover:underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-4">
                    {artifact.title}
                  </h3>
                  
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    Created: {new Date(artifact.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
