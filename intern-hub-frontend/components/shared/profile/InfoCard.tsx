export function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#161616]/10 bg-white/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">
        {title}
      </p>
      <p className="mt-1 break-words font-semibold text-[#171717]">{value}</p>
    </div>
  );
}
