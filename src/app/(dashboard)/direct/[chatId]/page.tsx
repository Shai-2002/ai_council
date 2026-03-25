export default async function DirectChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="h-14 shrink-0 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 gap-2 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Direct Chat
        </div>
        <span className="text-xs text-zinc-400 ml-2 font-mono">{chatId}</span>
      </div>
      
      {/* Import the client component dynamically, or render it here */}
      <DirectChatContainer chatId={chatId} />
    </div>
  );
}

import { DirectChatInterface } from "@/components/direct/DirectChatInterface";
import { SidePanel } from "@/components/panel/SidePanel";
import { useWorkspace } from "@/lib/hooks/useWorkspace";

function DirectChatContainer({ chatId }: { chatId: string }) {
  const { workspaceId } = useWorkspace();
  
  return (
    <div className="flex-1 min-h-0 bg-zinc-50/50 dark:bg-zinc-950 relative flex">
      <div className="flex-1 min-w-0 h-full relative">
        <DirectChatInterface chatId={chatId} />
      </div>
      <SidePanel 
        workspaceId={workspaceId || "default"}
        chatId={chatId}
        mode="direct"
      />
    </div>
  );
}
