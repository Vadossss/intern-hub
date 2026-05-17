export function VacanciesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/75 p-6 shadow-sm">
        <div className="h-8 w-2/5 animate-pulse rounded bg-[#161616]/10" />
        <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-[#161616]/10" />
      </div>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-[1.25rem] border border-[#161616]/10 bg-white/75 p-5 shadow-sm"
        >
          <div className="h-6 w-3/5 animate-pulse rounded bg-[#161616]/10" />
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
          </div>
          <div className="mt-5 h-16 animate-pulse rounded-xl bg-[#161616]/10" />
        </div>
      ))}
    </div>
  );
}
