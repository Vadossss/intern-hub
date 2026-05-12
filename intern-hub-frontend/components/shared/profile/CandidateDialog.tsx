"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, UserRound } from "lucide-react";

import { RichTextContent } from "@/components/shared/RichText";
import { InfoCard } from "@/components/shared/profile/InfoCard";
import { ResumeExtendedDetails } from "@/components/shared/profile/ResumeExtendedDetails";
import {
  formatBirthday,
  formatMoney,
  mediaUrl,
} from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CandidateProfile } from "@/lib/api/profile";

export function CandidateDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: CandidateProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const avatarSrc = mediaUrl(candidate?.avatarUrl);
  const activeResumes =
    candidate?.resumes?.filter((resume) => !resume.archived) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Профиль кандидата</DialogTitle>
        </DialogHeader>
        {candidate ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#edf3ea] text-[#48644d]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={candidate.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {[candidate.firstName, candidate.lastName]
                    .filter(Boolean)
                    .join(" ") || candidate.email}
                </h2>
                <p className="mt-1 text-sm text-[#626262]">{candidate.email}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Почта" value={candidate.email || "Не указана"} />
              <InfoCard
                title="Номер телефона"
                value={candidate.phoneNumber || "Не указан"}
              />
              <InfoCard
                title="День рождения"
                value={formatBirthday(candidate.birthday)}
              />
              <InfoCard
                title="Статус поиска"
                value={
                  candidate.openToWork === false
                    ? "Не ищет работу"
                    : "Открыт к предложениям"
                }
              />
            </div>
            {activeResumes.length ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#171717]">Резюме</h3>
                {activeResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <BriefcaseBusiness className="h-4 w-4 text-[#777]" />
                      <p className="font-semibold text-[#171717]">
                        {resume.profession || "Резюме"}
                      </p>
                      <Badge variant="outline" className="rounded-lg bg-white">
                        {formatMoney(
                          resume.expectedSalaryFrom,
                          resume.expectedSalaryTo,
                        )}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resume.city ? (
                        <Badge variant="outline" className="rounded-lg bg-white">
                          {resume.city}
                        </Badge>
                      ) : null}
                      {resume.employmentName ? (
                        <Badge variant="outline" className="rounded-lg bg-white">
                          {resume.employmentName}
                        </Badge>
                      ) : null}
                      {resume.workFormatName ? (
                        <Badge variant="outline" className="rounded-lg bg-white">
                          {resume.workFormatName}
                        </Badge>
                      ) : null}
                      {resume.experienceName ? (
                        <Badge variant="outline" className="rounded-lg bg-white">
                          {resume.experienceName}
                        </Badge>
                      ) : null}
                    </div>
                    <RichTextContent
                      value={resume.about}
                      fallback="Описание резюме пока не заполнено."
                      className="mt-3"
                    />
                    <ResumeExtendedDetails resume={resume} className="mt-4" />
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {candidate.userId ? (
                <Button asChild className="bg-[#171717] text-white">
                  <Link href={`/candidate/${candidate.userId}`}>
                    Публичная страница
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {candidate.resumeUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.resumeUrl} target="_blank">
                    Резюме
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {candidate.portfolioUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.portfolioUrl} target="_blank">
                    Портфолио
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
