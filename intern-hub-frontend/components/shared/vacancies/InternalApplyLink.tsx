"use client";

import { ArrowUpRight, MessageSquareText } from "lucide-react";

export function InternalApplyLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-left transition hover:border-[#3f5f4a]/35 hover:bg-[#edf3ea]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-[#3f5f4a]">
          <MessageSquareText className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#777]">
            Intern Hub
          </p>
          <p className="mt-1 break-words text-sm font-extrabold text-[#171717]">
            Откликнуться внутри сайта
          </p>
          <p className="mt-1 text-xs leading-5 text-[#666]">
            Работодатель получит отклик в личном кабинете.
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#777]" />
      </div>
    </button>
  );
}
