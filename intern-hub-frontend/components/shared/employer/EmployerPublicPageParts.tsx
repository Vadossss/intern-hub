import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function EmployerPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <Skeleton className="h-64 rounded-2xl bg-[#e6e2d8]" />
        <Skeleton className="h-14 rounded-2xl bg-[#e6e2d8]" />
        <Skeleton className="h-80 rounded-2xl bg-[#e6e2d8]" />
      </div>
    </main>
  );
}

export function InfoPill({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-[#161616]/10 bg-[#f7f7f4] px-3 py-2 font-semibold">
      <span className="text-[#777]">{icon}</span>
      {children}
    </span>
  );
}

export function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-[#161616]/10 bg-white p-3 text-[#171717]">
      <div className="mt-0.5 rounded-lg bg-[#edf3ea] p-2 text-[#3f5f4a]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#777]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold">{value}</p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block transition hover:opacity-85">
      {content}
    </a>
  ) : (
    content
  );
}

export function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-xl bg-[#171717] px-4 py-2.5 text-sm font-extrabold text-white"
          : "rounded-xl px-4 py-2.5 text-sm font-extrabold text-[#555] transition hover:bg-[#f4f1e9] hover:text-[#171717]"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}
