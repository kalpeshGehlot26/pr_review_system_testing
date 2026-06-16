import { create } from "zustand";
import type { ChatState, Message } from "./types";
import { conversations, defaultMessages, messages, users } from "./dummyData";

let messageSeq = 1000;

/**
 * Centralized global state store. Every component reads and writes chat data
 * EXCLUSIVELY through this store — no conversation state lives inside components.
 * State persists for the lifetime of the browser session.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  users,
  conversations,
  messages,
  selectedConversationId: "techpulse",
  selectedTab: "all",
  searchQuery: "",

  selectConversation: (id) => set({ selectedConversationId: id }),

  selectTab: (tab) => set({ selectedTab: tab }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  sendMessage: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return; // empty messages cannot be sent

    const { selectedConversationId, messages } = get();
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newMessage: Message = {
      id: `m-${messageSeq++}`,
      conversationId: selectedConversationId,
      authorId: "me",
      text: trimmed,
      time,
    };

    const existing = messages[selectedConversationId] ?? defaultMessages(selectedConversationId);

    set({
      messages: {
        ...messages,
        [selectedConversationId]: [...existing, newMessage],
      },
      conversations: get().conversations.map((c) =>
        c.id === selectedConversationId
          ? { ...c, lastMessage: trimmed, lastTime: time, unread: 0 }
          : c
      ),
    });
  },
}));

/** Convenience selector: the currently selected conversation object. */
export const selectActiveConversation = (s: ChatState) =>
  s.conversations.find((c) => c.id === s.selectedConversationId) ??
  s.conversations[0];

/** Convenience selector: messages for the active conversation. */
export const selectActiveMessages = (s: ChatState): Message[] =>
  s.messages[s.selectedConversationId] ??
  defaultMessages(s.selectedConversationId);
