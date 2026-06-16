"use client";

import { MoreVertical, Phone, Search, Video } from "lucide-react";
import type { Conversation } from "@/lib/types";
import Avatar from "./Avatar";

export default function ConversationHeader({ conversation }: { conversation: Conversation }) {
  const status =
    conversation.statusText ??
    (conversation.online ? "online" : "last seen recently");

  return (
    <header
      data-testid="conversation-header"
      className="flex items-center justify-between border-b border-slate-100 px-6 py-3.5"
    >
      <div className="flex items-center gap-3">
        <Avatar name={conversation.name} color={conversation.color} online={conversation.online} />
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{conversation.name}</h2>
          <p className="text-xs text-emerald-500">{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-slate-400">
        {[Search, Phone, Video, MoreVertical].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        ))}
      </div>
    </header>
  );
}
