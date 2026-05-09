import { Skeleton } from "@/components/ui/skeleton";

export function VacancyDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <Skeleton className="h-96 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-96 rounded-2xl bg-[#d8d4ca]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <Skeleton className="h-96 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-64 rounded-2xl bg-[#e6e2d8]" />
        </div>
      </div>
    </main>
  );
}
