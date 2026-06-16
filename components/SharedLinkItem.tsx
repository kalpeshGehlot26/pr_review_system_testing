"use client";

import { Video } from "lucide-react";
import type { SharedLink } from "@/lib/types";

const STYLES: Record<SharedLink["favicon"], string> = {
  meet: "bg-green-100 text-green-600",
  behance: "bg-blue-100 text-blue-600",
};

export default function SharedLinkItem({ link }: { link: SharedLink }) {
  return (
    <a
      data-testid="shared-link"
      href={`https://${link.url}`}
      onClick={(e) => e.preventDefault()}
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${STYLES[link.favicon]}`}
      >
        {link.favicon === "meet" ? <Video className="h-[18px] w-[18px]" /> : "Bē"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-700">{link.title}</p>
        <p className="truncate text-[11px] text-slate-400">{link.url}</p>
      </div>
    </a>
  );
}
