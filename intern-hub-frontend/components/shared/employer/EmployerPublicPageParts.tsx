import Link from "next/link";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function EmployerBreadcrumbs({
  current,
}: {
  current?: string;
}) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#666]"
    >
      <Link href="/" className="transition hover:text-[#171717]">
        Главная
      </Link>
      <span className="text-[#aaa]">/</span>
      {current ? (
        <Link href="/employers" className="transition hover:text-[#171717]">
          Компании
        </Link>
      ) : (
        <span className="text-[#171717]">Компании</span>
      )}
      {current ? (
        <>
          <span className="text-[#aaa]">/</span>
          <span className="max-w-[18rem] truncate text-[#171717] sm:max-w-[28rem]">
            {current}
          </span>
        </>
      ) : null}
    </nav>
  );
}

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
