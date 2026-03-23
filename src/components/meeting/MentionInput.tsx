"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoles } from "@/lib/hooks/useRoles";
import { FileUploadButton, FileChips, type UploadedFile } from "@/components/chat/FileUpload";

interface MentionInputProps {
  onSend: (text: string, fileIds?: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MentionInput({ onSend, placeholder = "Tag executives with @...", disabled }: MentionInputProps) {
  const { roles } = useRoles();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const rolesList = [
    { slug: "all", name: "Everyone", title: "Tag all executives", icon: "Users", bgDark: "bg-zinc-800" },
    ...roles,
  ];

  const filteredRoles = mentionQuery !== null
    ? rolesList.filter(r => 
        r.name.toLowerCase().includes(mentionQuery.toLowerCase()) || 
        r.title.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        r.slug.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : [];

  // Reset selection when query changes
  useEffect(() => {
    setMentionIndex(0);
  }, [mentionQuery]);

  const insertMention = (role: typeof rolesList[0]) => {
    if (!textareaRef.current || mentionQuery === null) return;
    const text = input;
    const cursor = textareaRef.current.selectionStart;
    const beforeCursor = text.slice(0, cursor);
    const afterCursor = text.slice(cursor);
    
    // Find where the @ started
    const lastAtPos = beforeCursor.lastIndexOf("@");
    if (lastAtPos !== -1) {
      const mentionText = role.slug === 'all' ? '@all ' : `@${role.name.toLowerCase()} `;
      const newBeforeCursor = beforeCursor.slice(0, lastAtPos) + mentionText;
      const newText = newBeforeCursor + afterCursor;
      setInput(newText);
      setMentionQuery(null);
      
      // Restore cursor focus after state updates
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = newBeforeCursor.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && filteredRoles.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % filteredRoles.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + filteredRoles.length) % filteredRoles.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        insertMention(filteredRoles[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9]*)$/);

    if (match) {
      setMentionQuery(match[1]);
    } else {
      setMentionQuery(null);
    }
  };

  const handleClick = () => {
    // Re-evaluate if we are still inside a mention block when clicking around
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = input.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9]*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const handleSend = () => {
    const trimmedInput = input.trim();
    const doneFiles = files.filter(f => f.status === 'done');
    const hasFiles = doneFiles.length > 0;

    if (!trimmedInput && !hasFiles) return;

    let text = trimmedInput;
    if (hasFiles) {
      const fileNote = `[Attached files: ${doneFiles.map(f => f.name).join(', ')}]`;
      text = trimmedInput
        ? `${trimmedInput}\n\n${fileNote}`
        : `Please review the attached file${doneFiles.length > 1 ? 's' : ''}: ${doneFiles.map(f => f.name).join(', ')}`;
    }

    onSend(text, doneFiles.map(f => f.id));
    setInput("");
    setFiles([]);
    setMentionQuery(null);
  };

  const handleFilesUploaded = (newFiles: UploadedFile[]) => {
    setFiles(prev => {
      const map = new Map(prev.map(f => [f.name, f]));
      newFiles.forEach(f => map.set(f.name, f));
      return Array.from(map.values());
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const hasContent = input.trim() || files.some(f => f.status === 'done');

  return (
    <div className="relative w-full shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      
      {/* Autocomplete Dropdown */}
      {mentionQuery !== null && filteredRoles.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-xl overflow-hidden z-50">
          <div className="p-1 max-h-[300px] overflow-y-auto">
            {filteredRoles.map((role, idx) => (
              <button
                key={role.slug}
                type="button"
                onClick={() => insertMention(role)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  idx === mentionIndex
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${role.bgDark} text-white font-medium text-[10px]`}>
                  {role.name[0]}
                </div>
                <div className="flex flex-col select-none">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
                    {role.name}
                  </span>
                  <span className="text-xs text-zinc-500 mt-1 leading-none">{role.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Chips */}
      <FileChips files={files} onRemove={removeFile} />

      {/* Input Box */}
      <div className="px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-end gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-400 relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <div className="shrink-0 self-end mb-1 ml-1">
              <FileUploadButton onFilesUploaded={handleFilesUploaded} />
            </div>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onClick={handleClick}
              onKeyUp={handleClick}
              placeholder={placeholder}
              disabled={disabled}
              className="block min-h-[52px] max-h-[120px] flex-1 resize-none border-0 bg-transparent py-3.5 pl-1 pr-14 text-left text-base leading-normal placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none"
              rows={1}
            />
            
            <Button
              type="button"
              size="icon"
              className={`absolute right-2 bottom-2 h-9 w-9 rounded-xl transition-all ${
                hasContent
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white hover:opacity-90 shadow-sm"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700"
              }`}
              onClick={handleSend}
              disabled={!hasContent || disabled}
            >
              <SendHorizontal className="h-4 w-4" />
              <span className="sr-only">Send Message</span>
            </Button>
            
          </div>
          <div className="text-center mt-2 pb-1">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              Mention specific roles with @ to direct questions to them.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
