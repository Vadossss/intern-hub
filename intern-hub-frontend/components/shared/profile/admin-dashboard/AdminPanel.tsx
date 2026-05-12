"use client";

import type { ReactNode } from "react";

export function AdminPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-extrabold text-[#171717]">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
