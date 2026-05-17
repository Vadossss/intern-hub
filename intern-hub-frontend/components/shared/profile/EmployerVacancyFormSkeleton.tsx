"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function EmployerVacancyFormSkeleton() {
  return (
    <div className="grid gap-5 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-56 bg-[#e4e0d6]" />
          <Skeleton className="h-4 w-36 bg-[#eeeae1]" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32 rounded-xl bg-[#e4e0d6]" />
          <Skeleton className="h-10 w-28 rounded-xl bg-[#eeeae1]" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
      </div>

      <Skeleton className="h-40 rounded-md bg-white" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
        <Skeleton className="h-10 rounded-md bg-white" />
      </div>

      <div className="rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-[#e4e0d6]" />
            <Skeleton className="h-3 w-32 bg-[#eeeae1]" />
          </div>
          <Skeleton className="h-11 w-full max-w-sm rounded-xl bg-white" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-9 w-28 rounded-xl bg-white"
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 bg-[#e4e0d6]" />
            <Skeleton className="h-4 w-72 max-w-full bg-[#eeeae1]" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl bg-[#e4e0d6]" />
        </div>
        <div className="mt-4 grid gap-3 rounded-xl border border-[#161616]/10 bg-[#f7f7f3] p-3 lg:grid-cols-[13rem_1fr_1fr_auto]">
          <Skeleton className="h-10 rounded-md bg-white" />
          <Skeleton className="h-10 rounded-md bg-white" />
          <Skeleton className="h-10 rounded-md bg-white" />
          <Skeleton className="h-10 w-10 rounded-xl bg-white" />
        </div>
      </div>

      <Skeleton className="h-10 w-44 rounded-xl bg-[#171717]/20" />
    </div>
  );
}
