"use client";

import { Suspense } from "react";

import { BlogContent } from "./BlogContent";
import { BlogPageSkeleton } from "./BlogPageSkeleton";

export function BlogPage() {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogContent />
    </Suspense>
  );
}
