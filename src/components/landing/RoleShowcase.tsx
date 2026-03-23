import { ROLES } from "@/lib/roles-config";
import * as LucideIcons from "lucide-react";

function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

const customQuotes: Record<string, string> = {
  ceo: "What's the worst case and can we survive it?",
  coo: "Who's actually doing this and what happens if step 3 is late?",
  cfo: "Back it with numbers or I'm not interested.",
  product: "Who specifically needs this? Name one person.",
  marketing: "Where do these people actually hang out?"
};

export function RoleShowcase() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16 md:mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
          Meet your council
        </h2>
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Every executive has a specific mandate. They don&apos;t hallucinate—they focus on their domain and output actionable deliverables in their distinct voice.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(ROLES).map((role) => (
          <div 
            key={role.slug}
            className={`group rounded-3xl border ${role.border} bg-white dark:bg-zinc-950 p-8 flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
          >
            {/* Background Hint */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 ${role.bgDark} opacity-5 dark:opacity-10 rounded-full blur-3xl transition-opacity group-hover:opacity-10 dark:group-hover:opacity-20`} />

            <div className="flex items-center gap-4 mb-6 relative">
              <div className="relative">
                <div className={`p-4 rounded-2xl ${role.bgDark} text-white shadow-md`}>
                  <IconByName name={role.icon} className="h-6 w-6" />
                </div>
                {/* Active Indicator */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-zinc-950" />
              </div>
              <div>
                <h3 className={`text-xl font-extrabold tracking-tight ${role.text}`}>{role.name}</h3>
                <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">{role.title}</p>
              </div>
            </div>
            
            {/* Quote Block */}
            <div className={`mb-6 p-4 rounded-2xl ${role.bgLight} border ${role.border} border-opacity-50 relative`}>
              <div className={`absolute -top-3 left-6 text-4xl leading-none opacity-40 ${role.text}`}>&ldquo;</div>
              <p className={`text-sm italic font-medium ${role.text} pt-2`}>
                {customQuotes[role.slug] || role.description}
              </p>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 mb-8 flex-1 leading-relaxed">
              {role.description}.
            </p>
            
            {/* Footer / Outputs */}
            <div className={`mt-auto pt-6 border-t ${role.border} border-opacity-30 flex items-center justify-between`}>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-1">Standard Output</span>
                <span className={`text-sm font-semibold flex items-center gap-2 ${role.text}`}>
                  <IconByName name="FileText" className="h-4 w-4" />
                  {role.artifactType}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
