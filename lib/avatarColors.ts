/** Shared avatar gradient palette (used by onboarding + chat). */
export const AVATAR_COLORS: { id: string; value: string }[] = [
  { id: "violet", value: "from-violet-400 to-indigo-500" },
  { id: "blue", value: "from-sky-400 to-blue-500" },
  { id: "rose", value: "from-rose-400 to-pink-500" },
  { id: "amber", value: "from-amber-400 to-orange-500" },
  { id: "emerald", value: "from-emerald-400 to-teal-500" },
  { id: "fuchsia", value: "from-fuchsia-400 to-purple-500" },
  { id: "cyan", value: "from-cyan-400 to-sky-500" },
  { id: "lime", value: "from-lime-400 to-green-500" },
];

export const DEFAULT_AVATAR_COLOR = AVATAR_COLORS[0].value;

export const INTEREST_OPTIONS = [
  "Design",
  "Engineering",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Operations",
  "Finance",
];

export const STATUS_OPTIONS = [
  "Available",
  "Busy",
  "In a meeting",
  "Working remotely",
];
