"use client";

import type { ReactNode } from "react";
import Link from "next/link";

export function AdminMetricCard({
  detail,
  href,
  icon,
  label,
  value,
}: {
  detail: string;
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm transition hover:border-[#3f5f4a]/30 hover:bg-[#f8f7f2]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-[#edf3ea] p-3 text-[#48644d]">{icon}</div>
        <span className="text-2xl font-black text-[#171717]">{value}</span>
      </div>
      <p className="mt-4 text-sm font-extrabold text-[#171717]">{label}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-[#777]">{detail}</p>
    </Link>
  );
}
