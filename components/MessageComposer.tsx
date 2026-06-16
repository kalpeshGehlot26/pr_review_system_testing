"use client";

import { Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/lib/store";

export default function MessageComposer() {
  const [text, setText] = useState("");
  const sendMessage = useChatStore((s) => s.sendMessage);

  const submit = () => {
    if (!text.trim()) return; // empty messages cannot be sent
    sendMessage(text);
    setText("");
  };

  return (
    <footer
      data-testid="composer"
      className="flex items-center gap-2 border-t border-slate-100 px-5 py-3"
    >
      <button
        type="button"
        data-testid="composer-attach"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        title="Attach"
      >
        <Paperclip className="h-[18px] w-[18px]" />
      </button>

      <div className="flex flex-1 items-center gap-2 rounded-full bg-slate-100 px-4">
        <input
          data-testid="composer-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Your message..."
          className="flex-1 bg-transparent py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="button"
          data-testid="composer-emoji"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600"
          title="Emoji"
        >
          <Smile className="h-[18px] w-[18px]" />
        </button>
      </div>

      <button
        type="button"
        data-testid="composer-send"
        onClick={submit}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-all duration-150 hover:bg-blue-600 active:scale-90"
        title="Send"
      >
        <Send className="h-[18px] w-[18px]" />
      </button>
    </footer>
  );
}
