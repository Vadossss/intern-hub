"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Cake,
  Eye,
  ExternalLink,
  FileText,
  Flag,
  Mail,
  MapPin,
  MessageCircle,
  Monitor,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

import { RichTextContent } from "@/components/shared/RichText";
import { ChatInviteDialog } from "@/components/shared/chat/ChatInviteDialog";
import { ComplaintDialog } from "@/components/shared/complaints";
import { ResumeExtendedDetails } from "@/components/shared/profile/ResumeExtendedDetails";
import {
  CandidatePageSkeleton,
  ContactLink,
  DarkInfo,
  InfoPill,
} from "@/components/shared/candidate/CandidatePublicPageParts";
import {
  formatBirthday,
  formatExpectedSalary,
  getFullName,
} from "@/components/shared/candidate/candidatePublicUtils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCandidateById,
  type PublicCandidateProfile,
} from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/context";
import { resolveAssetUrl } from "@/lib/assets";

export function CandidatePublicPage() {
  const params = useParams();
  const candidateId = String(params.id ?? "");
  const { user } = useAuth();

  const [candidate, setCandidate] = useState<PublicCandidateProfile | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaintResume, setComplaintResume] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [inviteResume, setInviteResume] = useState<{
    id: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCandidate() {
      try {
        setLoading(true);
        setError(null);

        const response = await getCandidateById(candidateId);

        if (active) {
          setCandidate(response);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить профиль соискателя.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (candidateId) {
      loadCandidate();
    }

    return () => {
      active = false;
    };
  }, [candidateId]);

  const avatarUrl = useMemo(
    () => resolveAssetUrl(candidate?.avatarUrl),
    [candidate?.avatarUrl],
  );
  const activeResumes = useMemo(
    () => candidate?.resumes?.filter((resume) => !resume.archived) ?? [],
    [candidate?.resumes],
  );
  const primaryResume = activeResumes[0];
  const candidateCity = primaryResume?.city || candidate?.city;
  const canInvite =
    user?.role === "ROLE_EMPLOYER" || user?.role === "ROLE_ADMIN";

  if (loading) {
    return <CandidatePageSkeleton />;
  }

  if (error || !candidate) {
    return (
      <main className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#171717]">
            Соискатель недоступен
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#606060]">
            {error ?? "Не удалось получить данные профиля."}
          </p>
          <Button asChild className="mt-6 rounded-xl bg-[#171717] text-white">
            <Link href="/vacancies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              К вакансиям
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const fullName = getFullName(candidate);

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Button
          asChild
          variant="ghost"
          className="rounded-xl text-[#4a4a4a] hover:bg-white/70"
        >
          <Link href="/vacancies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            К вакансиям
          </Link>
        </Button>

        <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#161616]/10 bg-[#f7f7f4] text-[#3f5f4a] sm:h-28 sm:w-28">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-12 w-12" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="mt-4 text-3xl font-black leading-tight text-[#111] sm:text-4xl">
                  {fullName}
                </h1>
                {primaryResume?.profession ? (
                  <p className="mt-2 text-lg font-semibold text-[#3f5f4a]">
                    {primaryResume.profession}
                  </p>
                ) : null}
                <Badge variant="outline" className="mt-3 rounded-full bg-[#f7f7f4]">
                  {candidate.openToWork === false
                    ? "Не ищет работу"
                    : "Открыт к предложениям"}
                </Badge>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#555]">
                  <InfoPill icon={<MapPin className="h-4 w-4" />}>
                    {candidateCity || "Город не указан"}
                  </InfoPill>
                  <InfoPill icon={<Cake className="h-4 w-4" />}>
                    {formatBirthday(candidate.birthday)}
                  </InfoPill>
                  <InfoPill icon={<Wallet className="h-4 w-4" />}>
                    {formatExpectedSalary(primaryResume)}
                  </InfoPill>
                  <InfoPill icon={<Eye className="h-4 w-4" />}>
                    {primaryResume?.viewCount ?? 0}
                  </InfoPill>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-[#161616]/10 bg-[#171717] p-6 text-white shadow-sm">
            <Sparkles className="h-6 w-6 text-white/70" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">
              Предпочтения
            </p>
            <div className="mt-4 space-y-3">
              <DarkInfo
                icon={<MapPin className="h-4 w-4" />}
                label="Город"
                value={candidateCity || "Не указан"}
              />
              <DarkInfo
                icon={<Monitor className="h-4 w-4" />}
                label="Формат"
                value={
                  primaryResume?.workFormatName || "Не указан"
                }
              />
              <DarkInfo
                icon={<Briefcase className="h-4 w-4" />}
                label="Занятость"
                value={
                  primaryResume?.employmentName || "Не указана"
                }
              />
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#171717]">
                Резюме
              </h2>
              <div className="mt-5 space-y-4">
                {activeResumes.length ? (
                  activeResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="rounded-2xl border border-[#161616]/10 bg-[#f7f7f4] p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-xl font-extrabold text-[#171717]">
                            {resume.profession || "Резюме"}
                          </h3>
                          <p className="mt-2 text-sm font-semibold text-[#555]">
                            {formatExpectedSalary(resume)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {resume.city ? (
                            <Badge
                              variant="outline"
                              className="rounded-full bg-white"
                            >
                              {resume.city}
                            </Badge>
                          ) : null}
                          {resume.employmentName ? (
                            <Badge
                              variant="outline"
                              className="rounded-full bg-white"
                            >
                              {resume.employmentName}
                            </Badge>
                          ) : null}
                          {resume.workFormatName ? (
                            <Badge
                              variant="outline"
                              className="rounded-full bg-white"
                            >
                              {resume.workFormatName}
                            </Badge>
                          ) : null}
                          {resume.experienceName ? (
                            <Badge
                              variant="outline"
                              className="rounded-full bg-white"
                            >
                              {resume.experienceName}
                            </Badge>
                          ) : null}
                          <Badge
                            variant="outline"
                            className="rounded-full bg-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {resume.viewCount ?? 0}
                          </Badge>
                          {canInvite ? (
                            <Button
                              type="button"
                              className="h-8 rounded-full bg-[#0b63f6] px-3 text-xs font-bold text-white hover:bg-[#0956d8]"
                              onClick={() =>
                                setInviteResume({
                                  id: resume.id,
                                  label: resume.profession || "Резюме",
                                })
                              }
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Пригласить
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 rounded-full border-[#161616]/10 bg-white px-3 text-xs font-bold text-[#5f4545] hover:bg-[#f7eeee]"
                            onClick={() =>
                              setComplaintResume({
                                id: resume.id,
                                label: resume.profession || "Резюме",
                              })
                            }
                          >
                            <Flag className="h-3.5 w-3.5" />
                            Пожаловаться
                          </Button>
                        </div>
                      </div>

                      <RichTextContent
                        value={resume.about}
                        fallback="Описание резюме пока не заполнено."
                        className="mt-4 text-[15px]"
                      />

                      <ResumeExtendedDetails resume={resume} className="mt-4" />

                      <div className="mt-4 flex flex-wrap gap-2">
                        {resume.skills?.length ? (
                          resume.skills.map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="outline"
                              className="rounded-full border-[#161616]/15 bg-white px-3 py-1.5 text-sm font-semibold text-[#444]"
                            >
                              {skill.name}
                            </Badge>
                          ))
                        ) : null}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#666]">
                    Соискатель пока не добавил резюме.
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
                Контакты и ссылки
              </p>
              <div className="mt-4 space-y-3">
                <ContactLink
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={candidate.email || "Не указан"}
                  href={candidate.email ? `mailto:${candidate.email}` : undefined}
                />
                <ContactLink
                  icon={<FileText className="h-4 w-4" />}
                  label="Резюме"
                  value={candidate.resumeUrl ? "Открыть резюме" : "Не указано"}
                  href={candidate.resumeUrl}
                />
                <ContactLink
                  icon={<ExternalLink className="h-4 w-4" />}
                  label="Портфолио"
                  value={
                    candidate.portfolioUrl ? "Открыть портфолио" : "Не указано"
                  }
                  href={candidate.portfolioUrl}
                />
              </div>
            </div>
          </aside>
        </section>
      </div>
      {inviteResume ? (
        <ChatInviteDialog
          resumeId={inviteResume.id}
          candidateName={fullName}
          open={Boolean(inviteResume)}
          onOpenChange={(open) => {
            if (!open) {
              setInviteResume(null);
            }
          }}
        />
      ) : null}
      <ComplaintDialog
        open={Boolean(complaintResume)}
        onOpenChange={(open) => {
          if (!open) {
            setComplaintResume(null);
          }
        }}
        targetType="CANDIDATE_RESUME"
        targetId={complaintResume ? String(complaintResume.id) : ""}
        targetLabel={complaintResume?.label ?? "резюме"}
      />
    </main>
  );
}
