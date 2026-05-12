"use client";

export function AdminWorkflowStep({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4">
      <p className="text-sm font-extrabold text-[#171717]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#666]">{text}</p>
    </div>
  );
}
