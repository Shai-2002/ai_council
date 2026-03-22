import { Message, Role } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function MessageBubble({ message, role }: { message: Message; role: Role }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <Avatar className={`h-8 w-8 shrink-0 mt-1 ${isUser ? "bg-zinc-200 dark:bg-zinc-800" : role.bgDark + " text-white"}`}>
          <AvatarFallback className="text-sm font-medium">
            {isUser ? "S" : role.name[0]}
          </AvatarFallback>
        </Avatar>

        {/* Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {isUser ? "You" : role.name}
            </span>
            {!isUser && (
              <span className={`text-xs ${role.text} font-medium`}>
                {role.title}
              </span>
            )}
          </div>
          
          <div 
            className={`px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed
              ${isUser 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm" 
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-tl-sm"
              }
            `}
          >
            {/* Hacky markdown renderer for strong/italic since we aren't using MD library */}
            {message.content.split('\n').map((line, i) => {
              if (line.startsWith('**') && line.includes('**', 2)) {
                const parts = line.split('**');
                return <p key={i} className={i !== 0 ? "mt-3" : ""}><strong className="font-semibold">{parts[1]}</strong>{parts[2]}</p>;
              }
              if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={i} className={`mt-4 italic opacity-80 ${isUser ? "" : role.text}`}>{line.slice(1, -1)}</p>;
              }
              return <p key={i} className={i !== 0 ? "mt-3" : ""}>{line}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
