"use client";

import { Suspense } from "react";

import { FiltersSkeleton } from "./FiltersSkeleton";
import { VacanciesContent } from "./VacanciesContent";
import { VacanciesSkeleton } from "./VacanciesSkeleton";

export function VacanciesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f1e9] px-4 py-10">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <FiltersSkeleton />
            <VacanciesSkeleton />
          </div>
        </div>
      }
    >
      <VacanciesContent />
    </Suspense>
  );
}
