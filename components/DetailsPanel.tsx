"use client";

import { selectActiveConversation, useChatStore } from "@/lib/store";
import Avatar from "./Avatar";
import MemberAvatarList from "./MemberAvatarList";
import SharedFileItem from "./SharedFileItem";
import SharedLinkItem from "./SharedLinkItem";

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h4 className="text-xs font-semibold text-slate-700">{title}</h4>
      <button type="button" className="text-[11px] font-medium text-violet-500 hover:underline">
        See all
      </button>
    </div>
  );
}

export default function DetailsPanel() {
  const conversation = useChatStore(selectActiveConversation);
  const users = useChatStore((s) => s.users);

  const members = conversation.memberIds
    .filter((id) => id !== "me")
    .map((id) => users[id])
    .filter(Boolean);

  return (
    <aside
      data-testid="details-panel"
      className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-slate-100 bg-white"
    >
      <div className="flex flex-col items-center px-6 pb-5 pt-7 text-center">
        <Avatar name={conversation.name} color={conversation.color} size="xl" online={conversation.online} />
        <h3 className="mt-3 text-base font-semibold text-slate-800">{conversation.name}</h3>
        <p className="text-xs text-emerald-500">{conversation.statusText ?? "online"}</p>
      </div>

      <div className="space-y-5 px-6 pb-8">
        {conversation.about && (
          <p className="text-xs leading-relaxed text-slate-500">{conversation.about}</p>
        )}

        <section data-testid="members-section">
          <SectionHeading title="Members" />
          <MemberAvatarList
            members={members}
            total={conversation.membersCount ?? members.length}
          />
        </section>

        <section data-testid="photos-section">
          <SectionHeading title="Photos and videos" />
          <div className="grid grid-cols-4 gap-1.5">
            {conversation.photos.map((p, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg bg-gradient-to-br ${p}`}
              />
            ))}
          </div>
        </section>

        <section data-testid="files-section">
          <SectionHeading title="Shared files" />
          <div className="space-y-0.5">
            {conversation.files.length > 0 ? (
              conversation.files.map((f) => <SharedFileItem key={f.id} file={f} />)
            ) : (
              <p className="px-2 py-2 text-[11px] text-slate-400">No files shared yet</p>
            )}
          </div>
        </section>

        <section data-testid="links-section">
          <SectionHeading title="Shared links" />
          <div className="space-y-0.5">
            {conversation.links.length > 0 ? (
              conversation.links.map((l) => <SharedLinkItem key={l.id} link={l} />)
            ) : (
              <p className="px-2 py-2 text-[11px] text-slate-400">No links shared yet</p>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
