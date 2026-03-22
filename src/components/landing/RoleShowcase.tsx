import { ROLES } from "@/lib/roles-config";
import * as LucideIcons from "lucide-react";

function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function RoleShowcase() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Meet your council
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Every executive has a specific mandate. They don&apos;t hallucinate—they focus on their domain and output actionable deliverables.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {Object.values(ROLES).map((role) => (
          <div 
            key={role.slug}
            className={`rounded-2xl border ${role.border} bg-white dark:bg-zinc-950 p-6 flex flex-col hover:shadow-lg transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${role.bgDark} text-white`}>
                <IconByName name={role.icon} className="h-6 w-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${role.text}`}>{role.name}</h3>
                <p className="text-sm font-medium text-zinc-500">{role.title}</p>
              </div>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 mb-6 flex-1">
              {role.description}.
            </p>
            <div className={`mt-auto pt-4 border-t ${role.border} bg-opacity-50 flex items-center justify-between`}>
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">Outputs</span>
              <span className={`text-sm font-medium px-2.5 py-1.5 rounded-md ${role.bgLight} ${role.text}`}>
                {role.artifactType}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
