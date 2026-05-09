"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Pagination({
  pageNumber,
  totalPages,
  first,
  last,
  onPageChange,
}: {
  pageNumber: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (page) =>
      Math.abs(page - pageNumber) <= 2 || page === 0 || page === totalPages - 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#161616]/10 bg-white/75 p-3 shadow-sm">
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        disabled={first}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const needsGap = previous !== undefined && page - previous > 1;

        return (
          <span key={page} className="inline-flex items-center gap-2">
            {needsGap ? <span className="text-[#777]">...</span> : null}
            <Button
              type="button"
              variant={page === pageNumber ? "default" : "outline"}
              className={
                page === pageNumber
                  ? "rounded-xl bg-[#171717] text-white"
                  : "rounded-xl"
              }
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </Button>
          </span>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        disabled={last}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Далее
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
