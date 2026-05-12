import Link from "next/link";
import { ArrowUpRight, Loader2, UserRound } from "lucide-react";

import { RichTextContent } from "@/components/shared/RichText";
import { formatMoney, mediaUrl } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CandidateResumeSearchResult } from "@/lib/api/profile";

export function CandidatesLoadingState() {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] text-sm text-[#626262]">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Загружаем соискателей
    </div>
  );
}

export function CandidatesEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] p-6 text-sm leading-6 text-[#626262]">
      По этим фильтрам соискатели не найдены.
    </div>
  );
}

export function CandidatesPagination({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[#161616]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[#626262]">
        Страница {page + 1} из {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={page === 0 || isLoading}
          onClick={() => onPageChange(Math.max(page - 1, 0))}
        >
          Назад
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={page >= totalPages - 1 || isLoading}
          onClick={() => onPageChange(Math.min(page + 1, totalPages - 1))}
        >
          Вперёд
        </Button>
      </div>
    </div>
  );
}

export function CandidateSearchCard({
  candidate,
  onOpenCandidate,
}: {
  candidate: CandidateResumeSearchResult;
  onOpenCandidate: (candidate: CandidateResumeSearchResult) => void;
}) {
  const avatarSrc = mediaUrl(candidate.avatarUrl);
  const candidateName =
    [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
    candidate.email;
  const resume = candidate.resume;
  const displaySkills = resume.skills ?? [];
  const description = resume.about;

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#edf3ea] text-[#48644d]">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={candidateName}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words text-lg font-extrabold text-[#171717]">
                {candidateName}
              </p>
              <Badge
                variant="outline"
                className="rounded-lg bg-[#f7f7f3] text-xs"
              >
                {candidate.openToWork !== false
                  ? "Открыт к предложениям"
                  : "Не ищет работу"}
              </Badge>
            </div>
            {resume.profession ? (
              <p className="mt-1 text-sm font-semibold text-[#171717]">
                {resume.profession}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-[#626262]">
              {resume.city || "Город не указан"}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#3f5f4a]">
              {formatMoney(
                resume.expectedSalaryFrom,
                resume.expectedSalaryTo,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {resume.employmentName ? (
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {resume.employmentName}
                </Badge>
              ) : null}
              {resume.workFormatName ? (
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {resume.workFormatName}
                </Badge>
              ) : null}
              {resume.experienceName ? (
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {resume.experienceName}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenCandidate(candidate)}
          >
            Профиль
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/candidate/${candidate.userId}`}>
              <ArrowUpRight className="h-4 w-4" />
              Страница
            </Link>
          </Button>
        </div>
      </div>

      {description ? (
        <RichTextContent
          value={description}
          className="mt-4 line-clamp-3 text-sm text-[#626262]"
        />
      ) : null}

      {displaySkills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {displaySkills.slice(0, 8).map((skill) => (
            <Badge
              key={skill.id}
              variant="outline"
              className="rounded-lg bg-[#f7f7f3]"
            >
              {skill.name}
            </Badge>
          ))}
          {displaySkills.length > 8 ? (
            <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
              +{displaySkills.length - 8}
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
