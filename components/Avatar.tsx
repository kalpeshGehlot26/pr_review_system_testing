interface AvatarProps {
  name: string;
  /** Tailwind gradient classes, e.g. "from-violet-400 to-indigo-500". */
  color: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const SIZES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const DOT = {
  xs: "h-1.5 w-1.5",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({ name, color, size = "md", online }: AvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br ${color} ${SIZES[size]} font-semibold text-white shadow-sm`}
      >
        {initials(name)}
      </div>
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${DOT[size]} rounded-full border-2 border-white bg-emerald-500`}
        />
      )}
    </div>
  );
}
