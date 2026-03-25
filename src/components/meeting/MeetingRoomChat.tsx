"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMeetingRoom } from "@/lib/hooks/useMeetingRoom";
import { MentionInput } from "./MentionInput";
import { RoleBubble } from "./RoleBubble";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useRoles } from "@/lib/hooks/useRoles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ROLE_NAMES: Record<string, string> = {
  ceo: 'Aria', coo: 'Dev', cfo: 'Maya', product: 'Kai', marketing: 'Priya',
};

interface MeetingRoomChatProps {
  chatId: string;
  workspaceId: string;
  projectId?: string;
}

export function MeetingRoomChat({ chatId, workspaceId, projectId: _projectId }: MeetingRoomChatProps) {
  const { roles, rolesMap } = useRoles();
  const {
    messages,
    activeRoles,
    isLoading,
    showSimulationPopup,
    suggestions,
    setSuggestions,
    sendMessage,
    approveSimulation,
    denySimulation,
    loadHistory,
    stop,
  } = useMeetingRoom(chatId, workspaceId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  // Initial load
  useEffect(() => {
    loadHistory();
    return () => stop();
  }, [loadHistory, stop]);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    shouldAutoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  useEffect(() => {
    if (shouldAutoScroll.current && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      });
    }
  }, [messages, activeRoles]);

  // Derived participants logic
  const participantIds = Array.from(new Set(messages.filter(m => m.role === 'assistant' && m.roleSlug).map(m => m.roleSlug)));
  
  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 relative">
      
      {/* Participants Bar */}
      <div className="shrink-0 h-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 flex items-center px-4 gap-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Present:</span>
        <div className="flex items-center -space-x-1 overflow-hidden pointer-events-none">
          {roles.map(role => {
            const hasSpoken = participantIds.includes(role.slug);
            return (
              <div 
                key={role.slug} 
                className={`h-6 w-6 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[8px] font-bold text-white shrink-0
                  ${hasSpoken ? role.bgDark : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600'}`}
                title={role.name}
              >
                {role.name[0]}
                {hasSpoken && (
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-white dark:border-zinc-950" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 mb-4 flex items-center gap-2">
                 {roles.slice(0,3).map((r,i) => (
                    <div key={i} className={`h-8 w-8 rounded-full ${r.bgDark} text-white flex items-center justify-center font-bold shadow-sm`}>{r.name[0]}</div>
                 ))}
                 <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold ml-1">+2</span>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Executive Meeting Room
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                Tag roles like <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">@ceo</code> or <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">@all</code> to request specific decisions. Executives can debate amongst themselves.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'user') {
              // Create mock Message format to pass to existing MessageBubble
              const userMsgMock = {
                id: msg.id,
                role: 'user' as const,
                content: msg.content,
              };
              const dummyRole = rolesMap['ceo']; // only used for assistant styles
              return <MessageBubble key={msg.id} message={userMsgMock} role={dummyRole} />;
            } else {
              // Render RoleBubble
              return (
                <RoleBubble 
                  key={msg.id}
                  roleSlug={msg.roleSlug!}
                  roleName={msg.roleName!}
                  content={msg.content} 
                />
              );
            }
          })}

          {/* Active Streaming Roles */}
          {activeRoles.map((activeMsg) => (
            <RoleBubble 
              key={activeMsg.roleSlug}
              roleSlug={activeMsg.roleSlug}
              roleName={activeMsg.roleName}
              content={activeMsg.content}
              isStreaming={true}
            />
          ))}

        </div>
        <div ref={messagesEndRef} className="h-px" />
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2 items-center bg-white dark:bg-zinc-950">
          <span className="text-xs text-zinc-400">Suggested:</span>
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => {
                sendMessage(`@${s.suggestedRole} respond to what ${ROLE_NAMES[s.fromRole] || s.fromRole} just said`);
                setSuggestions(prev => prev.filter(x => x.id !== s.id));
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              Ask @{ROLE_NAMES[s.suggestedRole] || s.suggestedRole} to respond
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <MentionInput
        onSend={(text: string, fileIds?: string[]) => sendMessage(text, fileIds)}
        disabled={isLoading || showSimulationPopup}
      />

      {/* Simulation Dialog */}
      <Dialog open={showSimulationPopup} onOpenChange={(open) => {
        // Only allow close via buttons
        if (!open && showSimulationPopup) return;
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simulation Detected</DialogTitle>
            <DialogDescription>
              Your message involves multiple executives with complex instructions. Want to let the simulation run for 5-10 minutes? (Might take longer depending on the requests)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={denySimulation}>
              Cancel
            </Button>
            <Button onClick={approveSimulation} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-0">
              Run Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
