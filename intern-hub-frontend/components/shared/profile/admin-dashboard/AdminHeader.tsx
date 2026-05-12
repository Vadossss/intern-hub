"use client";

import type { ReactNode } from "react";

export function AdminHeader({
  action,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#171717]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#666]">
            {description}
          </p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
