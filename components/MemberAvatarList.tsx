"use client";

import type { User } from "@/lib/types";
import Avatar from "./Avatar";

interface Props {
  members: User[];
  total: number;
  max?: number;
}

export default function MemberAvatarList({ members, total, max = 6 }: Props) {
  const shown = members.slice(0, max);
  const remaining = total - shown.length;

  return (
    <div className="flex items-center" data-testid="member-list">
      {shown.map((m, i) => (
        <div key={m.id} className={i === 0 ? "" : "-ml-2"} style={{ zIndex: max - i }}>
          <div className="rounded-full ring-2 ring-white">
            <Avatar name={m.name} color={m.color} size="sm" />
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-600 ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
}
