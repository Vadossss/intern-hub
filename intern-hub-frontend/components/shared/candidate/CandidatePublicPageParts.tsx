import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { resolveAssetUrl } from "@/lib/assets";

export function CandidatePageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-56 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-56 rounded-2xl bg-[#d8d4ca]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <Skeleton className="h-96 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-72 rounded-2xl bg-[#e6e2d8]" />
        </div>
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

export function DarkInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mt-0.5 rounded-lg bg-white/10 p-2 text-white/80">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/50">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ContactLink({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string | null;
}) {
  const normalizedHref = href ? resolveAssetUrl(href) : undefined;
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-3 text-[#171717]">
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

  return normalizedHref ? (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noreferrer"
      className="block transition hover:opacity-85"
    >
      {content}
    </a>
  ) : (
    content
  );
}
