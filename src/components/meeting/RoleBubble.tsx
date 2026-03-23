import { ROLES } from "@/lib/roles-config";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface RoleBubbleProps {
  roleSlug: string;
  roleName: string;
  content: string;
  isStreaming?: boolean;
}

export function RoleBubble({ roleSlug, roleName, content, isStreaming }: RoleBubbleProps) {
  const role = ROLES[roleSlug] || {
    name: roleName || roleSlug,
    title: "AI",
    bgDark: "bg-zinc-600",
    text: "text-zinc-700 dark:text-zinc-300",
    border: "border-zinc-200 dark:border-zinc-800",
  };

  const getBorderColor = (colorClass: string) => {
    // Attempting to extract root hue or fallback to zinc
    // For specific tailwind colors mapping from roles-config
    if (colorClass.includes("indigo")) return "border-l-indigo-500";
    if (colorClass.includes("emerald")) return "border-l-emerald-500";
    if (colorClass.includes("amber")) return "border-l-amber-500";
    if (colorClass.includes("violet")) return "border-l-violet-500";
    if (colorClass.includes("rose")) return "border-l-rose-500";
    return "border-l-zinc-300 dark:border-l-zinc-700";
  };

  return (
    <div className="flex w-full mb-6 justify-start">
      <div className="flex max-w-[85%] sm:max-w-[75%] gap-4 flex-row">
        {/* Avatar */}
        <Avatar className={`h-8 w-8 shrink-0 mt-1 ${role.bgDark} text-white`}>
          <AvatarFallback className="text-sm font-medium">
            {role.name?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Bubble Area */}
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hidden sm:inline-block">
              {role.name}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${role.bgDark} text-white`}>
              {role.title || "AI"}
            </span>
          </div>

          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white dark:bg-zinc-900 shadow-sm rounded-tl-sm border-y border-r border-zinc-200 dark:border-zinc-800 w-full border-l-2 ${getBorderColor(role.bgDark)}`}
          >
            {content || isStreaming ? (
               <div className="prose prose-sm dark:prose-invert max-w-none">
                 <ReactMarkdown
                   remarkPlugins={[remarkGfm]}
                   components={{
                     p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                     ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                     ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                     li: ({ children }) => <li className="mb-1">{children}</li>,
                     strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                     h1: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
                     h2: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-1">{children}</h3>,
                     h3: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
                     hr: () => <hr className="my-3 border-border" />,
                     code: ({ className, children, ...props }) => {
                       const isInline = !className;
                       if (isInline) {
                         return <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>{children}</code>;
                       }
                       return <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2"><code className="text-sm" {...props}>{children}</code></pre>;
                     },
                   }}
                 >
                   {content}
                 </ReactMarkdown>
                 
                 {isStreaming && (
                   <span className="inline-flex items-center gap-1 mt-1">
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                     <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                   </span>
                 )}
               </div>
            ) : (
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
