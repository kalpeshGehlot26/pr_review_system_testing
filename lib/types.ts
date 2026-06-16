export type NavTab =
  | "all"
  | "work"
  | "personal"
  | "saved"
  | "calendar"
  | "files"
  | "settings";

export interface User {
  id: string;
  name: string;
  /** Tailwind gradient classes used for the generated avatar. */
  color: string;
  online?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  /** "me" for the current user's outgoing messages. */
  text: string;
  /** Display timestamp, e.g. "10:18". */
  time: string;
  /** Date-separator label rendered ABOVE this message, when present. */
  dateLabel?: string;
}

export interface SharedFile {
  id: string;
  name: string;
  meta: string;
  kind: "doc" | "sheet" | "pdf" | "image";
}

export interface SharedLink {
  id: string;
  title: string;
  url: string;
  favicon: "meet" | "behance";
}

export interface Conversation {
  id: string;
  name: string;
  color: string;
  isGroup: boolean;
  membersCount?: number;
  online?: boolean;
  statusText?: string;
  about?: string;
  lastMessage: string;
  lastTime: string;
  unread?: number;
  pinned?: boolean;
  memberIds: string[];
  photos: string[]; // gradient classes for the photo grid
  files: SharedFile[];
  links: SharedLink[];
}

export interface ChatState {
  users: Record<string, User>;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  selectedConversationId: string;
  selectedTab: NavTab;
  searchQuery: string;

  // actions
  selectConversation: (id: string) => void;
  selectTab: (tab: NavTab) => void;
  setSearchQuery: (q: string) => void;
  sendMessage: (text: string) => void;
}
