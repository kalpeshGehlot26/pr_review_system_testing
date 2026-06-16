import type { Conversation, Message, User } from "./types";

const G = {
  violet: "from-violet-400 to-indigo-500",
  rose: "from-rose-400 to-pink-500",
  amber: "from-amber-400 to-orange-500",
  emerald: "from-emerald-400 to-teal-500",
  sky: "from-sky-400 to-blue-500",
  fuchsia: "from-fuchsia-400 to-purple-500",
  lime: "from-lime-400 to-green-500",
  cyan: "from-cyan-400 to-sky-500",
  slate: "from-slate-400 to-slate-500",
};

export const users: Record<string, User> = {
  me: { id: "me", name: "You", color: G.sky, online: true },
  virginia: { id: "virginia", name: "Virginia Jordan", color: G.rose, online: true },
  gregory: { id: "gregory", name: "Gregory Williams", color: G.emerald, online: true },
  michelle: { id: "michelle", name: "Michelle Davis", color: G.amber },
  joseph: { id: "joseph", name: "Joseph King", color: G.violet },
  brian: { id: "brian", name: "Brian Alexander", color: G.cyan },
  harry: { id: "harry", name: "Harry Dennis", color: G.fuchsia },
  carolyn: { id: "carolyn", name: "Carolyn Jones", color: G.lime },
  michael: { id: "michael", name: "Michael Wallace", color: G.slate },
  mark: { id: "mark", name: "Mark Barnett", color: G.amber },
  lucille: { id: "lucille", name: "Lucille Baldwin", color: G.rose },
};

const teamMembers = [
  "virginia",
  "gregory",
  "michelle",
  "joseph",
  "brian",
  "harry",
  "carolyn",
];

function conv(c: Partial<Conversation> & Pick<Conversation, "id" | "name" | "lastMessage" | "lastTime">): Conversation {
  return {
    color: G.violet,
    isGroup: false,
    memberIds: ["me", c.id!],
    photos: [G.sky, G.rose, G.amber, G.emerald, G.violet, G.cyan],
    files: [],
    links: [],
    ...c,
  } as Conversation;
}

export const conversations: Conversation[] = [
  conv({
    id: "techpulse",
    name: "TechPulse Company",
    color: G.violet,
    isGroup: true,
    membersCount: 52,
    online: true,
    statusText: "52 members, 8 online",
    about:
      "TechPulse Team Chat. Working together, sharing ideas and communicating effectively.",
    lastMessage: "Reminder that we have a project sched…",
    lastTime: "10:30",
    pinned: true,
    memberIds: ["me", ...teamMembers],
    files: [
      { id: "f1", name: "terms_of_reference.docx", meta: "2.3 MB", kind: "doc" },
      { id: "f2", name: "contracting_agreement.xls", meta: "1.1 MB", kind: "sheet" },
      { id: "f3", name: "clientlogo.svg", meta: "0.2 MB", kind: "image" },
    ],
    links: [
      { id: "l1", title: "Google Meet", url: "meet.google.com/abc-defg-hij", favicon: "meet" },
      { id: "l2", title: "Behance", url: "behance.net/techpulse", favicon: "behance" },
    ],
  }),
  conv({ id: "michelle", name: "Michelle Davis", color: G.amber, lastMessage: "Just finished a workout and feeling am…", lastTime: "10:15", unread: 2 }),
  conv({ id: "joseph", name: "Joseph King", color: G.violet, lastMessage: "Please prepare a presentation on the t…", lastTime: "09:52" }),
  conv({ id: "brian", name: "Brian Alexander", color: G.cyan, lastMessage: "Okay. Please review and approve the s…", lastTime: "09:40", unread: 1 }),
  conv({ id: "harry", name: "Harry Dennis", color: G.fuchsia, lastMessage: "I'd be reduced to changes to the…", lastTime: "09:21" }),
  conv({ id: "carolyn", name: "Carolyn Jones", color: G.lime, lastMessage: "Please report on the tasks completed f…", lastTime: "Mon", unread: 3 }),
  conv({ id: "michael", name: "Michael Wallace", color: G.slate, lastMessage: "Make sure that all documents for the c…", lastTime: "Mon" }),
  conv({ id: "mark", name: "Mark Barnett", color: G.amber, lastMessage: "Just downloaded that we have a proj…", lastTime: "Sun", unread: 5 }),
  conv({ id: "lucille", name: "Lucille Baldwin", color: G.rose, lastMessage: "Good morning, could you please proce…", lastTime: "Sun" }),
  conv({ id: "design", name: "Design Team", color: G.fuchsia, isGroup: true, membersCount: 12, statusText: "12 members", lastMessage: "New mockups are ready for review", lastTime: "Sun", memberIds: ["me", "virginia", "harry", "carolyn"] }),
  conv({ id: "marketing", name: "Marketing", color: G.emerald, isGroup: true, membersCount: 24, statusText: "24 members", lastMessage: "Campaign metrics look great this week", lastTime: "Fri", unread: 1, memberIds: ["me", "michelle", "joseph"] }),
  conv({ id: "gregory", name: "Gregory Williams", color: G.emerald, lastMessage: "Can you send me a copy of the report?", lastTime: "Fri" }),
  conv({ id: "virginia", name: "Virginia Jordan", color: G.rose, lastMessage: "Sure, I'll send it right away.", lastTime: "Thu" }),
  conv({ id: "engineering", name: "Engineering", color: G.sky, isGroup: true, membersCount: 31, statusText: "31 members", lastMessage: "Deploy is live 🚀", lastTime: "Thu", memberIds: ["me", "brian", "michael"] }),
  conv({ id: "random", name: "Random", color: G.cyan, isGroup: true, membersCount: 48, statusText: "48 members", lastMessage: "Anyone up for lunch?", lastTime: "Wed", memberIds: ["me", "mark", "lucille"] }),
  conv({ id: "hr", name: "People & Culture", color: G.violet, isGroup: true, membersCount: 9, statusText: "9 members", lastMessage: "Reminder: benefits enrollment", lastTime: "Wed", memberIds: ["me", "carolyn"] }),
];

export const messages: Record<string, Message[]> = {
  techpulse: [
    { id: "m1", conversationId: "techpulse", authorId: "virginia", text: "report1106-26.ppt", time: "10:08", dateLabel: "Today" },
    { id: "m2", conversationId: "techpulse", authorId: "virginia", text: "Hi, I've just finished my report.", time: "10:08" },
    { id: "m3", conversationId: "techpulse", authorId: "me", text: "Great job! How long did it take you?", time: "10:10" },
    { id: "m4", conversationId: "techpulse", authorId: "virginia", text: "About two hours. I had to check some data and make sure everything was accurate. I also included the latest sales figures in the appendix.", time: "10:14" },
    { id: "m5", conversationId: "techpulse", authorId: "gregory", text: "Can you send me a copy of the report? I need to review it before we submit it to the boss.", time: "10:16" },
    { id: "m6", conversationId: "techpulse", authorId: "virginia", text: "Sure, I'll send it right away.", time: "10:17" },
    { id: "m7", conversationId: "techpulse", authorId: "me", text: "Have a question about the report. Did you include the latest sales figures?", time: "10:19" },
    { id: "m8", conversationId: "techpulse", authorId: "virginia", text: "Yes, they're in the appendix. They show an increase in sales compared to last month.", time: "10:21" },
  ],
  michelle: [
    { id: "md1", conversationId: "michelle", authorId: "michelle", text: "Just finished a workout and feeling amazing!", time: "10:15", dateLabel: "Today" },
    { id: "md2", conversationId: "michelle", authorId: "me", text: "That's great to hear! 💪", time: "10:16" },
  ],
  brian: [
    { id: "mb1", conversationId: "brian", authorId: "brian", text: "Okay. Please review and approve the schedule.", time: "09:40", dateLabel: "Today" },
  ],
};

export const defaultMessages = (conversationId: string): Message[] => [
  {
    id: `${conversationId}-seed`,
    conversationId,
    authorId: conversationId,
    text: "Hey there! 👋",
    time: "09:00",
    dateLabel: "Today",
  },
];
