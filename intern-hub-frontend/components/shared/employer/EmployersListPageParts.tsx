import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
} from "lucide-react";

import { RichTextContent } from "@/components/shared/RichText";
import {
  getEmployerPublicId,
} from "@/components/shared/employer/EmployersListPage.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicEmployerProfile } from "@/lib/api/employers";
import { resolveAssetUrl } from "@/lib/assets";

export function EmployerCard({ employer }: { employer: PublicEmployerProfile }) {
  const employerId = getEmployerPublicId(employer);
  const href = employerId ? `/employers/${employerId}` : "/employers";
  const companyName = employer.companyName || "Компания без названия";
  const logoUrl = resolveAssetUrl(employer.avatarUrl ?? employer.logoUrl);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#3f5f4a]/30 hover:shadow-[0_14px_36px_rgba(20,20,20,0.08)]">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#161616]/10 bg-[#f7f7f4] text-[#3f5f4a]">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-8 w-8" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {employer.verified ? (
              <Badge className="rounded-full bg-[#edf3ea] px-2.5 py-1 text-xs text-[#3f5f4a] hover:bg-[#edf3ea]">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                Проверена
              </Badge>
            ) : null}
          </div>

          <Link
            href={href}
            className="mt-2 block truncate text-xl font-black leading-tight text-[#111] transition hover:text-[#3f5f4a]"
          >
            {companyName}
          </Link>

          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm font-semibold text-[#606060]">
            <MapPin className="h-4 w-4 shrink-0 text-[#777]" />
            <span className="truncate">{employer.city || "Город не указан"}</span>
          </p>
        </div>
      </div>

      <RichTextContent
        value={employer.about}
        fallback="Компания пока не добавила описание."
        className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm"
      />

      <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
        <Button
          asChild
          className="h-10 flex-1 rounded-xl bg-[#171717] text-white"
        >
          <Link href={href}>Профиль</Link>
        </Button>
        {employer.website ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl bg-white text-[#3f5f4a]"
          >
            <a href={employer.website} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Сайт
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

export function EmployersGridSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[#161616]/10 bg-white p-5"
        >
          <div className="flex gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl bg-[#e6e2d8]" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3 rounded-full bg-[#e6e2d8]" />
              <Skeleton className="h-4 w-1/2 rounded-full bg-[#e6e2d8]" />
            </div>
          </div>
          <Skeleton className="mt-5 h-16 rounded-xl bg-[#e6e2d8]" />
          <Skeleton className="mt-5 h-10 rounded-xl bg-[#e6e2d8]" />
        </div>
      ))}
    </section>
  );
}

export function EmployersPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <Skeleton className="h-56 rounded-2xl bg-[#e6e2d8]" />
        <EmployersGridSkeleton />
      </div>
    </main>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[#161616]/15 bg-white/70 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#3f5f4a]">
        <Building2 className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-[#171717]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#606060]">
        {description}
      </p>
    </section>
  );
}

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
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (page) =>
      Math.abs(page - pageNumber) <= 2 ||
      page === 0 ||
      page === totalPages - 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#161616]/10 bg-white/75 p-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-xl bg-white"
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
                  : "rounded-xl bg-white"
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
        className="rounded-xl bg-white"
        disabled={last}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Далее
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
