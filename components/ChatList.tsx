"use client";

import { Search } from "lucide-react";
import { useChatStore } from "@/lib/store";
import ChatListItem from "./ChatListItem";

export default function ChatList() {
  const conversations = useChatStore((s) => s.conversations);
  const selectedId = useChatStore((s) => s.selectedConversationId);
  const searchQuery = useChatStore((s) => s.searchQuery);
  const setSearchQuery = useChatStore((s) => s.setSearchQuery);
  const selectConversation = useChatStore((s) => s.selectConversation);

  const filtered = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section
      data-testid="chat-list"
      className="flex w-[340px] shrink-0 flex-col border-r border-slate-100 bg-white"
    >
      <header className="px-5 pb-3 pt-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            data-testid="chat-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-full bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </header>

      <div className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {filtered.map((c) => (
          <ChatListItem
            key={c.id}
            conversation={c}
            active={c.id === selectedId}
            onSelect={selectConversation}
          />
        ))}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-400">
            No conversations found
          </p>
        )}
      </div>
    </section>
  );
}
