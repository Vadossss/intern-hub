"use client";

import type { AdminWorkspaceSection } from "./types";

export function AdminSectionSkeleton({ section }: { section: AdminWorkspaceSection }) {
  const rows = section === "overview" ? 3 : 5;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <div className="h-3 w-36 animate-pulse rounded-full bg-[#e4e0d6]" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded-lg bg-[#e4e0d6]" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[#eeeae1]" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-[#eeeae1]" />
      </div>

      {section === "overview" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-11 w-11 animate-pulse rounded-xl bg-[#e4e0d6]" />
                <div className="h-7 w-12 animate-pulse rounded-lg bg-[#e4e0d6]" />
              </div>
              <div className="mt-4 h-4 w-28 animate-pulse rounded-full bg-[#e4e0d6]" />
              <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-[#eeeae1]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4"
              >
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-[#e4e0d6]" />
                <div className="mt-3 h-4 w-1/2 animate-pulse rounded-full bg-[#eeeae1]" />
                <div className="mt-4 flex gap-2">
                  <div className="h-8 w-24 animate-pulse rounded-xl bg-[#e4e0d6]" />
                  <div className="h-8 w-24 animate-pulse rounded-xl bg-[#eeeae1]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
