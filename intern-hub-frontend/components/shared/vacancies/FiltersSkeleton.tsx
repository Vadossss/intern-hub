export function FiltersSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-[#161616]/10" />
          <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
        <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
      </div>
    </div>
  );
}
