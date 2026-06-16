"use client";

import {
  Bookmark,
  Calendar,
  FolderClosed,
  type LucideIcon,
  MessagesSquare,
  Settings,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useChatStore } from "@/lib/store";
import type { NavTab } from "@/lib/types";
import Avatar from "./Avatar";

const ITEMS: { tab: NavTab; label: string; icon: LucideIcon }[] = [
  { tab: "all", label: "All chats", icon: MessagesSquare },
  { tab: "work", label: "Work", icon: Users },
  { tab: "personal", label: "Personal", icon: UserIcon },
  { tab: "saved", label: "Saved", icon: Bookmark },
  { tab: "calendar", label: "Calendar", icon: Calendar },
  { tab: "files", label: "Files", icon: FolderClosed },
];

export default function NavSidebar() {
  const selectedTab = useChatStore((s) => s.selectedTab);
  const selectTab = useChatStore((s) => s.selectTab);

  return (
    <nav
      data-testid="nav-sidebar"
      className="flex w-[76px] shrink-0 flex-col items-center gap-1 border-r border-slate-100 bg-white py-5"
    >
      <div className="mb-4" data-testid="nav-avatar">
        <Avatar name="You" color="from-violet-500 to-indigo-600" size="md" online />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        {ITEMS.map(({ tab, label, icon: Icon }) => {
          const active = selectedTab === tab;
          return (
            <button
              key={tab}
              type="button"
              data-testid={`nav-${tab}`}
              data-active={active}
              onClick={() => selectTab(tab)}
              title={label}
              className={`group flex w-[60px] flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-medium transition-all duration-150 ${
                active
                  ? "bg-violet-50 text-violet-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <Icon
                className={`h-[22px] w-[22px] transition-transform duration-150 group-hover:scale-110 ${
                  active ? "text-violet-600" : ""
                }`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        data-testid="nav-settings"
        data-active={selectedTab === "settings"}
        onClick={() => selectTab("settings")}
        title="Settings"
        className={`group flex w-[60px] flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-medium transition-all duration-150 ${
          selectedTab === "settings"
            ? "bg-violet-50 text-violet-600"
            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        }`}
      >
        <Settings className="h-[22px] w-[22px] transition-transform duration-150 group-hover:rotate-45" />
        <span>Settings</span>
      </button>
    </nav>
  );
}
