"use client";

import type { Message, User } from "@/lib/types";
import Avatar from "./Avatar";

interface Props {
  message: Message;
  author: User;
  mine: boolean;
}

export default function MessageBubble({ message, author, mine }: Props) {
  return (
    <div
      data-testid="message-bubble"
      data-direction={mine ? "outgoing" : "incoming"}
      className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
      style={{ animation: "bubble-in 220ms ease-out" }}
    >
      {!mine && <Avatar name={author.name} color={author.color} size="sm" />}
      <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
        {!mine && (
          <span className="mb-0.5 px-1 text-xs font-semibold text-violet-500">
            {author.name}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            mine
              ? "rounded-br-md bg-blue-500 text-white"
              : "rounded-bl-md bg-slate-100 text-slate-700"
          }`}
        >
          {message.text}
        </div>
        <span className="mt-1 px-1 text-[10px] text-slate-400">{message.time}</span>
      </div>
    </div>
  );
}
