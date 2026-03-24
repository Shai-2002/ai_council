import { Plus, BotMessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DirectChatIndex() {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BotMessageSquare className="h-6 w-6 text-indigo-500" />
            Direct Model Chat
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Talk to raw AI models directly without overarching personas.</p>
        </div>
        <Link href={`/direct/chat-${Date.now()}`}>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
            <Plus className="h-4 w-4" /> New Direct Chat
          </Button>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50 dark:bg-zinc-900/30 border-dashed">
        <BotMessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No active direct chats</h3>
        <p className="text-zinc-500 max-w-sm mb-6">Create a new chat to interact directly with Claude, GPT-4, Gemini, and others using @mentions.</p>
        <Link href={`/direct/chat-${Date.now()}`}>
          <Button variant="outline" className="rounded-xl">Start a chat</Button>
        </Link>
      </div>
    </div>
  );
}
