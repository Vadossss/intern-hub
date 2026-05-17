"use client";

import type { ReactNode } from "react";

export function AdminMutedText({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] p-4 text-sm font-semibold text-[#777]">
      {children}
    </p>
  );
}
