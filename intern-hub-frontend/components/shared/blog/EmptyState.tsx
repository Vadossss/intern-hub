"use client";

import { Newspaper } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[#161616]/15 bg-white/70 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#3f5f4a]">
        <Newspaper className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-[#171717]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#606060]">
        {description}
      </p>
    </section>
  );
}
