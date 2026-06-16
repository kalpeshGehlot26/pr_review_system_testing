"use client";

import { useChatStore, selectActiveConversation, selectActiveMessages } from "@/lib/store";
import ConversationHeader from "./ConversationHeader";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";

export default function ConversationPanel() {
  const conversation = useChatStore(selectActiveConversation);
  const messages = useChatStore(selectActiveMessages);
  const users = useChatStore((s) => s.users);

  return (
    <section
      data-testid="conversation-panel"
      className="flex min-w-0 flex-1 flex-col bg-white"
    >
      <ConversationHeader conversation={conversation} />

      <div
        data-testid="message-list"
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
      >
        {messages.map((m) => {
          const author = users[m.authorId] ?? {
            id: m.authorId,
            name: conversation.name,
            color: conversation.color,
          };
          return (
            <div key={m.id} className="flex flex-col gap-4">
              {m.dateLabel && (
                <div className="flex justify-center" data-testid="date-separator">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                    {m.dateLabel}
                  </span>
                </div>
              )}
              <MessageBubble message={m} author={author} mine={m.authorId === "me"} />
            </div>
          );
        })}
      </div>

      <MessageComposer />
    </section>
  );
}
