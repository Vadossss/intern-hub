"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContactMethod,
  type VacancyResponseDto,
} from "@/app/types/api";
import { RichTextContent } from "@/components/shared/RichText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCandidateResumes,
  type CandidateResume,
} from "@/lib/api/profile";
import {
  applyToVacancy,
  getVacancyById,
} from "@/lib/api/vacancies";
import { useAuth } from "@/lib/auth/context";

import { ApplyCard } from "./ApplyCard";
import type { ApplyMode } from "./vacancyDetailsTypes";
import {
  buildContactHref,
  formatSalary,
  getApplyErrorMessage,
  hasCandidateAppliedToVacancy,
  isAlreadyAppliedError,
} from "./vacancyDetailsHelpers";
import { VacancyDetailsSkeleton } from "./VacancyDetailsSkeleton";

export function VacancyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = String(params.publicId ?? "");
  const { isAuthenticated, user } = useAuth();

  const [vacancy, setVacancy] = useState<VacancyResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyMode, setApplyMode] = useState<ApplyMode>("internal");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [candidateResumes, setCandidateResumes] = useState<CandidateResume[]>([]);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadVacancy() {
      try {
        setLoading(true);
        setError(null);

        const response = await getVacancyById(publicId);

        if (active) {
          setVacancy(response);
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить вакансию.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (publicId) {
      loadVacancy();
    }

    return () => {
      active = false;
    };
  }, [publicId]);

  useEffect(() => {
    let active = true;

    async function loadCandidateData() {
      if (!isAuthenticated || user?.role !== "ROLE_USER" || !publicId) {
        setCandidateResumes([]);
        setHasApplied(false);
        setIsResumeLoading(false);
        return;
      }

      try {
        setIsResumeLoading(true);
        const resumes = await getCandidateResumes();

        if (active) {
          setCandidateResumes(resumes);
        }
      } catch (resumeError) {
        console.error("Failed to load candidate resumes:", resumeError);
        if (active) {
          setCandidateResumes([]);
        }
      } finally {
        if (active) {
          setIsResumeLoading(false);
        }
      }

      try {
        const applied = await hasCandidateAppliedToVacancy(publicId);

        if (active) {
          setHasApplied(applied);
        }
      } catch (applicationHistoryError) {
        console.error(
          "Failed to load candidate applications:",
          applicationHistoryError,
        );

        if (active) {
          setHasApplied(false);
        }
      }
    }

    void loadCandidateData();

    return () => {
      active = false;
    };
  }, [isAuthenticated, publicId, user?.role]);

  const externalContacts = useMemo(
    () =>
      (vacancy?.contacts ?? []).filter(
        (contact) =>
          contact.chosenContactMethod !== ContactMethod.INTERNAL_CHAT &&
          Boolean(buildContactHref(contact)),
      ),
    [vacancy?.contacts],
  );

  const hasInternalApply = useMemo(
    () =>
      (vacancy?.contacts ?? []).some(
        (contact) =>
          contact.chosenContactMethod === ContactMethod.INTERNAL_CHAT,
      ),
    [vacancy?.contacts],
  );

  const activeCandidateResumes = useMemo(
    () => candidateResumes.filter((resume) => !resume.archived),
    [candidateResumes],
  );

  useEffect(() => {
    if (activeCandidateResumes.length === 0) {
      setSelectedResumeId(null);
      return;
    }

    setSelectedResumeId((current) =>
      current &&
      activeCandidateResumes.some((resume) => resume.id === current)
        ? current
        : activeCandidateResumes[0].id,
    );
  }, [activeCandidateResumes]);

  useEffect(() => {
    if (!vacancy) {
      return;
    }

    if (!hasInternalApply && externalContacts.length > 0) {
      setApplyMode("external");
      return;
    }

    if (hasInternalApply && externalContacts.length === 0) {
      setApplyMode("internal");
    }
  }, [externalContacts.length, hasInternalApply, vacancy]);

  const infoItems = useMemo(() => {
    if (!vacancy) {
      return [];
    }

    return [
      {
        label: "Формат",
        value: vacancy.workFormat?.name ?? "Не указан",
        icon: Briefcase,
      },
      {
        label: "Опыт",
        value: vacancy.experience?.name ?? "Не указан",
        icon: Clock3,
      },
      {
        label: "Занятость",
        value: vacancy.employment?.name ?? "Не указана",
        icon: Wallet,
      },
      {
        label: "Город",
        value: vacancy.city || "Не указан",
        icon: MapPin,
      },
    ];
  }, [vacancy]);

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(
      vacancy?.stack ? `/${vacancy.stack.toLowerCase()}/jobs` : "/vacancies",
    );
  }

  async function submitInternalApplication(event: FormEvent) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт соискателя, чтобы откликнуться.");
      return;
    }

    if (user?.role !== "ROLE_USER") {
      toast.error("Отклик внутри системы доступен только соискателям.");
      return;
    }

    if (hasApplied) {
      toast.message("Вы уже откликались на эту вакансию.");
      return;
    }

    if (activeCandidateResumes.length === 0) {
      toast.error("Для отклика нужно создать активное резюме.");
      return;
    }

    if (!selectedResumeId) {
      toast.error("Выберите резюме для отклика.");
      return;
    }

    try {
      setIsSubmitting(true);
      await applyToVacancy(publicId, {
        coverLetter: coverLetter.trim() || undefined,
        resumeUrl: resumeUrl.trim() || undefined,
        resumeId: selectedResumeId,
        chosenContactMethod: ContactMethod.INTERNAL_CHAT,
      });

      setHasApplied(true);
      toast.success("Отклик отправлен работодателю.");
    } catch (submitError) {
      if (isAlreadyAppliedError(submitError)) {
        setHasApplied(true);
      }

      toast.error(getApplyErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <VacancyDetailsSkeleton />;
  }

  if (error || !vacancy) {
    return (
      <main className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#171717]">
            Вакансия недоступна
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#606060]">
            {error ?? "Не удалось получить данные вакансии."}
          </p>
          <Button
            className="mt-6 rounded-xl bg-[#171717] text-white"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl text-[#4a4a4a] hover:bg-white/70"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>

        <section className="grid items-start gap-5 lg:grid-cols-[1fr_23rem]">
          <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full bg-[#edf3ea] px-3 py-1 text-[#3f5f4a] hover:bg-[#edf3ea]">
                {vacancy.stack}
              </Badge>
              {vacancy.employer?.verified ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
                >
                  Проверенный работодатель
                </Badge>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-[#111] sm:text-4xl">
              {vacancy.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#555]">
              {vacancy.employer?.id ? (
                <Link
                  href={`/employers/${vacancy.employer.id}`}
                  className="inline-flex items-center gap-2 font-semibold text-[#3f5f4a] hover:underline"
                >
                  <Building2 className="h-4 w-4 text-[#777]" />
                  {vacancy.employer.companyName ?? "Компания не указана"}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4 text-[#777]" />
                  {vacancy.employer?.companyName ?? "Компания не указана"}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#777]" />
                {vacancy.city || "Локация не указана"}
              </span>
            </div>

            <div className="mt-6 rounded-2xl bg-[#171717] p-5 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">
                Зарплата
              </p>
              <p className="mt-2 text-3xl font-black leading-tight">
                {formatSalary(vacancy)}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {infoItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4"
                  >
                    <div className="flex items-center gap-2 text-[#777]">
                      <Icon className="h-4 w-4" />
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em]">
                        {item.label}
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-extrabold text-[#171717]">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <ApplyCard
            applyMode={applyMode}
            coverLetter={coverLetter}
            externalContacts={externalContacts}
            hasActiveResume={activeCandidateResumes.length > 0}
            hasInternalApply={hasInternalApply}
            hasApplied={hasApplied}
            isAuthenticated={isAuthenticated}
            isResumeLoading={isResumeLoading}
            isSubmitting={isSubmitting}
            resumeUrl={resumeUrl}
            resumes={activeCandidateResumes}
            selectedResumeId={selectedResumeId}
            userRole={user?.role}
            onApplyModeChange={setApplyMode}
            onCoverLetterChange={setCoverLetter}
            onResumeChange={setSelectedResumeId}
            onResumeUrlChange={setResumeUrl}
            onSubmit={submitInternalApplication}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-extrabold text-[#171717]">
              Описание вакансии
            </h2>
            <RichTextContent
              value={vacancy.description}
              fallback="Работодатель пока не добавил описание вакансии."
              className="mt-5 text-[15px]"
            />
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#171717]">
                Навыки
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {vacancy.skills?.length ? (
                  vacancy.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="rounded-full border-[#161616]/15 bg-[#f7f7f4] px-3 py-1.5 text-sm font-semibold text-[#444]"
                    >
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[#666]">Навыки не указаны.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#d7e8d7] bg-[#edf3ea] p-5 text-sm leading-6 text-[#34533a]">
              <CheckCircle2 className="h-5 w-5" />
              <p className="mt-3">
                Сначала выберите способ отклика сверху: отправьте заявку внутри
                Intern Hub или перейдите на внешний ресурс работодателя.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
