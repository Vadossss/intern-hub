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
import type { CandidateResumeSearchResult } from "@/lib/api/profile";

export function CandidateResumeSearchDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: CandidateResumeSearchResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const avatarSrc = mediaUrl(candidate?.avatarUrl);
  const resume = candidate?.resume;
  const candidateName =
    [candidate?.firstName, candidate?.lastName].filter(Boolean).join(" ") ||
    candidate?.email ||
    "РЎРѕРёСЃРєР°С‚РµР»СЊ";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>РЎРѕРёСЃРєР°С‚РµР»СЊ Рё СЂРµР·СЋРјРµ</DialogTitle>
        </DialogHeader>
        {candidate && resume ? (
          <div className="min-w-0 space-y-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#edf3ea] text-[#48644d]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={candidateName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-bold">{candidateName}</h2>
                <p className="mt-1 break-all text-sm text-[#626262]">
                  {candidate.email}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="РџРѕС‡С‚Р°" value={candidate.email || "РќРµ СѓРєР°Р·Р°РЅР°"} />
              <InfoCard
                title="РќРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°"
                value={candidate.phoneNumber || "РќРµ СѓРєР°Р·Р°РЅ"}
              />
              <InfoCard
                title="Р”РµРЅСЊ СЂРѕР¶РґРµРЅРёСЏ"
                value={formatBirthday(candidate.birthday)}
              />
              <InfoCard
                title="РЎС‚Р°С‚СѓСЃ РїРѕРёСЃРєР°"
                value={
                  candidate.openToWork === false
                    ? "РќРµ РёС‰РµС‚ СЂР°Р±РѕС‚Сѓ"
                    : "РћС‚РєСЂС‹С‚ Рє РїСЂРµРґР»РѕР¶РµРЅРёСЏРј"
                }
              />
            </div>

            <div className="min-w-0 overflow-hidden rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4 text-[#777]" />
                <p className="min-w-0 break-words font-semibold text-[#171717]">
                  {resume.profession || "Р РµР·СЋРјРµ"}
                </p>
                <Badge variant="outline" className="rounded-lg bg-white">
                  {formatMoney(resume.expectedSalaryFrom, resume.expectedSalaryTo)}
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
                fallback="РћРїРёСЃР°РЅРёРµ СЂРµР·СЋРјРµ РїРѕРєР° РЅРµ Р·Р°РїРѕР»РЅРµРЅРѕ."
                className="mt-3 max-w-full overflow-x-hidden break-words [&_.rich-code-frame]:max-w-full [&_pre]:max-w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words"
              />

              {resume.skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="max-w-full rounded-lg bg-white whitespace-normal break-words"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <ResumeExtendedDetails resume={resume} className="mt-4" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-[#171717] text-white">
                <Link href={`/candidate/${candidate.userId}`}>
                  РџСѓР±Р»РёС‡РЅР°СЏ СЃС‚СЂР°РЅРёС†Р°
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              {candidate.resumeUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.resumeUrl} target="_blank">
                    Р РµР·СЋРјРµ
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {candidate.portfolioUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.portfolioUrl} target="_blank">
                    РџРѕСЂС‚С„РѕР»РёРѕ
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
