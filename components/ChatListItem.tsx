"use client";

import type { Conversation } from "@/lib/types";
import Avatar from "./Avatar";

interface Props {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
}

export default function ChatListItem({ conversation, active, onSelect }: Props) {
  return (
    <button
      type="button"
      data-testid="chat-item"
      data-conversation-id={conversation.id}
      data-active={active}
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150 ${
        active ? "bg-violet-50" : "hover:bg-slate-50"
      }`}
    >
      <Avatar
        name={conversation.name}
        color={conversation.color}
        online={conversation.online}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-800">
            {conversation.name}
          </span>
          <span className="shrink-0 text-[11px] text-slate-400">
            {conversation.lastTime}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-slate-500">
            {conversation.lastMessage}
          </span>
          {conversation.unread ? (
            <span
              data-testid="unread-badge"
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-semibold text-white"
            >
              {conversation.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
