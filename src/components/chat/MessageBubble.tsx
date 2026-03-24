import { Message, Role } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VersionNavigator } from "./VersionNavigator";
import { RetryButton } from "./RetryButton";
import { ViolationBanner } from "../commitments/ViolationBanner";
import { CommitmentDetectionCard } from "../commitments/CommitmentDetectionCard";

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

          {!isUser && message.violation && message.violatedRule && (
            <ViolationBanner
              ruleText={message.violatedRule}
              onOverride={() => console.log('Overridden')}
              onUpdateRule={() => console.log('Update rule')}
            />
          )}

          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
              ${isUser
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm whitespace-pre-wrap"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-tl-sm"
              }
            `}
          >
            {isUser ? (
              message.content
            ) : (
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
                {message.content}
              </ReactMarkdown>
              </div>
            )}
            
            {/* Action Bar */}
            {!isUser && (
              <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap items-center justify-between gap-2 overflow-hidden group">
                <div className="flex items-center gap-3">
                  <VersionNavigator
                    versionGroupId={message.versionGroupId || message.id}
                    currentVersion={message.currentVersion || 1}
                    totalVersions={message.totalVersions || 1}
                    onSwitchVersion={(v) => console.log('Switch to version', v)}
                  />
                  {message.modelUsed && (
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      via {message.modelUsed}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 flex-1 min-w-[100px]">
                  <RetryButton
                    messageId={message.id}
                    onRetry={(id, model) => console.log('Retrying message', id, 'with model', model)}
                  />
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto whitespace-nowrap hidden sm:inline-block">Just now</span>
                </div>
              </div>
            )}
          </div>

          {!isUser && message.extractedRule && !message.isRuleConfirmed && (
            <CommitmentDetectionCard
              extractedRule={message.extractedRule}
              onConfirm={(scope) => console.log('Confirmed rule:', message.extractedRule, 'scope:', scope)}
              onDismiss={() => console.log('Dismissed rule')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
