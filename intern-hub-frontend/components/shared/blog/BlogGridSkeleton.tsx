"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BlogGridSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#161616]/10 bg-white"
        >
          <Skeleton className="h-52 rounded-none bg-[#e6e2d8]" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-4 w-1/2 rounded-full bg-[#e6e2d8]" />
            <Skeleton className="h-7 w-4/5 rounded-full bg-[#e6e2d8]" />
            <Skeleton className="h-16 rounded-xl bg-[#e6e2d8]" />
            <Skeleton className="h-10 w-28 rounded-xl bg-[#e6e2d8]" />
          </div>
        </div>
      ))}
    </section>
  );
}
