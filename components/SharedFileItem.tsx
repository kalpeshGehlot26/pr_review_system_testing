"use client";

import { FileSpreadsheet, FileText, ImageIcon, type LucideIcon } from "lucide-react";
import type { SharedFile } from "@/lib/types";

const ICONS: Record<SharedFile["kind"], { icon: LucideIcon; color: string }> = {
  doc: { icon: FileText, color: "bg-blue-100 text-blue-500" },
  sheet: { icon: FileSpreadsheet, color: "bg-emerald-100 text-emerald-500" },
  pdf: { icon: FileText, color: "bg-rose-100 text-rose-500" },
  image: { icon: ImageIcon, color: "bg-amber-100 text-amber-500" },
};

export default function SharedFileItem({ file }: { file: SharedFile }) {
  const { icon: Icon, color } = ICONS[file.kind];
  return (
    <div
      data-testid="shared-file"
      className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-700">{file.name}</p>
        <p className="text-[11px] text-slate-400">{file.meta}</p>
      </div>
    </div>
  );
}
