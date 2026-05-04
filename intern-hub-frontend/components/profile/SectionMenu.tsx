import { cn } from "@/lib/utils";

export function SectionMenu<T extends string>({
  items,
  active,
  onChange,
}: {
  items: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <nav className="grid gap-2 rounded-2xl border border-[#161616]/10 bg-white/85 p-2 shadow-sm">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#555] transition",
            active === item.id
              ? "bg-[#171717] text-white"
              : "hover:bg-[#f2f2ed] hover:text-[#171717]",
          )}
        >
          <span>{item.label}</span>
          {active === item.id ? (
            <span className="h-2 w-2 rounded-full bg-white" />
          ) : null}
        </button>
      ))}
    </nav>
  );
}
