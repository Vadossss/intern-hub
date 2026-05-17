"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { BlogGridSkeleton } from "./BlogGridSkeleton";

export function BlogPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <Skeleton className="h-16 rounded-2xl bg-[#e6e2d8]" />
        <BlogGridSkeleton />
      </div>
    </main>
  );
}
