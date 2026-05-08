"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContactMethod,
  type VacancyContact,
  type VacancyResponseDto,
} from "@/app/types/api";
import { RichTextContent } from "@/components/shared/RichText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import {
  getCandidateApplications,
  getCandidateResumes,
  type CandidateResume,
} from "@/lib/api/profile";
import {
  applyToVacancy,
  getVacancyById,
} from "@/lib/api/vacancies";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

type ApplyMode = "internal" | "external";

const contactIcons = {
  EMAIL: Mail,
  PHONE: Phone,
  TELEGRAM: Send,
  HH: Globe,
  SJ: Globe,
  EXTERNAL_LINK: ExternalLink,
  INTERNAL_CHAT: MessageSquareText,
} as const;

const contactLabels = {
  EMAIL: "Email",
  PHONE: "Телефон",
  TELEGRAM: "Telegram",
  HH: "HeadHunter",
  SJ: "SuperJob",
  EXTERNAL_LINK: "Внешняя ссылка",
  INTERNAL_CHAT: "Intern Hub",
} as const;

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
  const [candidateResumes, setCandidateResumes] = useState<CandidateResume[]>(
    [],
  );
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

function ApplyCard({
  applyMode,
  coverLetter,
  externalContacts,
  hasActiveResume,
  hasInternalApply,
  hasApplied,
  isAuthenticated,
  isResumeLoading,
  isSubmitting,
  resumeUrl,
  resumes,
  selectedResumeId,
  userRole,
  onApplyModeChange,
  onCoverLetterChange,
  onResumeChange,
  onResumeUrlChange,
  onSubmit,
}: {
  applyMode: ApplyMode;
  coverLetter: string;
  externalContacts: VacancyContact[];
  hasActiveResume: boolean;
  hasInternalApply: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
  isResumeLoading: boolean;
  isSubmitting: boolean;
  resumeUrl: string;
  resumes: CandidateResume[];
  selectedResumeId: number | null;
  userRole?: string;
  onApplyModeChange: (mode: ApplyMode) => void;
  onCoverLetterChange: (value: string) => void;
  onResumeChange: (resumeId: number | null) => void;
  onResumeUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const canApplyInternally =
    isAuthenticated &&
    userRole === "ROLE_USER" &&
    hasActiveResume &&
    !hasApplied &&
    Boolean(selectedResumeId) &&
    !isResumeLoading;
  const hasExternalApply = externalContacts.length > 0;
  const shouldShowModeSwitcher = hasInternalApply && hasExternalApply;
  const visibleMode = shouldShowModeSwitcher
    ? applyMode
    : hasInternalApply
      ? "internal"
      : "external";
  const [isInternalDialogOpen, setIsInternalDialogOpen] = useState(false);

  return (
    <aside className="sticky top-24 rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
            Отклик
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#171717]">
            Выберите способ
          </h2>
        </div>
        <div className="rounded-xl bg-[#edf3ea] p-3 text-[#3f5f4a]">
          <MessageSquareText className="h-5 w-5" />
        </div>
      </div>

      {shouldShowModeSwitcher ? (
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-1">
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-extrabold transition",
              applyMode === "internal"
                ? "bg-[#171717] text-white"
                : "text-[#555] hover:bg-white",
            )}
            onClick={() => onApplyModeChange("internal")}
          >
            Внутри сайта
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-extrabold transition",
              applyMode === "external"
                ? "bg-[#171717] text-white"
                : "text-[#555] hover:bg-white",
            )}
            onClick={() => onApplyModeChange("external")}
          >
            Внешний
          </button>
        </div>
      ) : null}

      {visibleMode === "internal" ? (
        <div className="mt-5 space-y-3">
          {hasInternalApply ? (
            <InternalApplyLink onClick={() => setIsInternalDialogOpen(true)} />
          ) : (
            <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
              Работодатель не добавил внутренний способ отклика для этой вакансии.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {externalContacts.length ? (
            externalContacts.map((contact, index) => (
              <ExternalApplyLink
                key={`${contact.chosenContactMethod}-${contact.contactValue}-${index}`}
                contact={contact}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
              Работодатель не добавил внешний способ отклика для этой вакансии.
            </div>
          )}
        </div>
      )}

      <InternalApplyDialog
        canApplyInternally={canApplyInternally}
        coverLetter={coverLetter}
        hasActiveResume={hasActiveResume}
        hasApplied={hasApplied}
        isAuthenticated={isAuthenticated}
        isOpen={isInternalDialogOpen}
        isResumeLoading={isResumeLoading}
        isSubmitting={isSubmitting}
        resumeUrl={resumeUrl}
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        userRole={userRole}
        onCoverLetterChange={onCoverLetterChange}
        onOpenChange={setIsInternalDialogOpen}
        onResumeChange={onResumeChange}
        onResumeUrlChange={onResumeUrlChange}
        onSubmit={onSubmit}
      />
    </aside>
  );
}

function InternalApplyLink({ onClick }: { onClick: () => void }) {
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

function InternalApplyDialog({
  canApplyInternally,
  coverLetter,
  hasActiveResume,
  hasApplied,
  isAuthenticated,
  isOpen,
  isResumeLoading,
  isSubmitting,
  resumeUrl,
  resumes,
  selectedResumeId,
  userRole,
  onCoverLetterChange,
  onOpenChange,
  onResumeChange,
  onResumeUrlChange,
  onSubmit,
}: {
  canApplyInternally: boolean;
  coverLetter: string;
  hasActiveResume: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
  isOpen: boolean;
  isResumeLoading: boolean;
  isSubmitting: boolean;
  resumeUrl: string;
  resumes: CandidateResume[];
  selectedResumeId: number | null;
  userRole?: string;
  onCoverLetterChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onResumeChange: (resumeId: number | null) => void;
  onResumeUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const selectedResume = resumes.find(
    (resume) => resume.id === selectedResumeId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Отклик внутри Intern Hub</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Войдите как соискатель, чтобы отправить отклик работодателю внутри
            Intern Hub.
            <Button
              asChild
              className="mt-3 w-full rounded-xl bg-[#171717] text-white"
            >
              <Link href="/auth">Войти</Link>
            </Button>
          </div>
        ) : userRole !== "ROLE_USER" ? (
          <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
            Внутренний отклик доступен только аккаунту соискателя.
          </div>
        ) : isResumeLoading ? (
          <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
            Проверяем активные резюме. Подождите несколько секунд.
          </div>
        ) : !hasActiveResume ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Для отклика нужно хотя бы одно активное резюме. Создайте или
            верните резюме из архива в профиле.
            <Button
              asChild
              className="mt-3 w-full rounded-xl bg-[#171717] text-white"
            >
              <Link href="/profile?section=resumes">Перейти к резюме</Link>
            </Button>
          </div>
        ) : hasApplied ? (
          <div className="rounded-xl border border-[#d7e8d7] bg-[#edf3ea] p-4 text-sm leading-6 text-[#34533a]">
            Отклик уже отправлен. Работодатель увидит его в своём кабинете.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Резюме для отклика
              </span>
              <select
                value={selectedResumeId ?? ""}
                required
                className="mt-2 h-11 w-full rounded-xl border border-[#161616]/10 bg-white px-3 text-sm font-semibold text-[#333] outline-none transition focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) =>
                  onResumeChange(Number(event.target.value) || null)
                }
              >
                <option value="" disabled>
                  Выберите резюме
                </option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resumeOptionLabel(resume)}
                  </option>
                ))}
              </select>
              {selectedResume ? (
                <p className="mt-2 text-xs leading-5 text-[#666]">
                  {resumeSummary(selectedResume)}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Сопроводительное письмо
              </span>
              <textarea
                value={coverLetter}
                rows={5}
                placeholder="Коротко расскажите, почему вам интересна вакансия."
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#161616]/10 bg-white px-3 py-3 text-sm leading-6 text-[#333] outline-none transition placeholder:text-[#999] focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) => onCoverLetterChange(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Дополнительная ссылка на резюме
              </span>
              <input
                value={resumeUrl}
                type="url"
                placeholder="https://..."
                className="mt-2 h-11 w-full rounded-xl border border-[#161616]/10 bg-white px-3 text-sm text-[#333] outline-none transition placeholder:text-[#999] focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) => onResumeUrlChange(event.target.value)}
              />
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Закрыть
              </Button>
              <Button
                type="submit"
                disabled={!canApplyInternally || isSubmitting}
                className="rounded-xl bg-[#171717] font-extrabold text-white hover:bg-black"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Отправляем..." : "Отправить отклик"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExternalApplyLink({
  contact,
}: {
  contact: VacancyContact;
}) {
  const href = buildContactHref(contact);
  const Icon = contactIcons[contact.chosenContactMethod] ?? ArrowUpRight;

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="block w-full rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-left transition hover:border-[#3f5f4a]/35 hover:bg-[#edf3ea]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-[#3f5f4a]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#777]">
            {contactLabels[contact.chosenContactMethod]}
          </p>
          <p className="mt-1 break-words text-sm font-extrabold text-[#171717]">
            {externalContactValue(contact)}
          </p>
          {contact.hint ? (
            <p className="mt-1 text-xs leading-5 text-[#666]">{contact.hint}</p>
          ) : null}
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#777]" />
      </div>
    </a>
  );
}

function VacancyDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <Skeleton className="h-96 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-96 rounded-2xl bg-[#d8d4ca]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[1fr_23rem]">
          <Skeleton className="h-96 rounded-2xl bg-[#e6e2d8]" />
          <Skeleton className="h-64 rounded-2xl bg-[#e6e2d8]" />
        </div>
      </div>
    </main>
  );
}

function formatSalary(vacancy: VacancyResponseDto) {
  const currency = vacancy.currency?.abbr || "₽";

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom.toLocaleString("ru-RU")} - ${vacancy.salaryTo.toLocaleString("ru-RU")} ${currency}`;
  }

  if (vacancy.salaryFrom) {
    return `от ${vacancy.salaryFrom.toLocaleString("ru-RU")} ${currency}`;
  }

  if (vacancy.salaryTo) {
    return `до ${vacancy.salaryTo.toLocaleString("ru-RU")} ${currency}`;
  }

  return "Зарплата не указана";
}

function buildContactHref(contact: VacancyContact) {
  const value = contact.contactValue?.trim();

  if (!value) {
    return null;
  }

  if (contact.chosenContactMethod === ContactMethod.EMAIL) {
    return `mailto:${value}`;
  }

  if (contact.chosenContactMethod === ContactMethod.PHONE) {
    return `tel:${value}`;
  }

  if (contact.chosenContactMethod === ContactMethod.TELEGRAM) {
    if (value.startsWith("@")) {
      return `https://t.me/${value.slice(1)}`;
    }

    if (!/^https?:\/\//i.test(value) && !value.includes(".")) {
      return `https://t.me/${value}`;
    }

    return normalizeExternalUrl(value);
  }

  if (
    contact.chosenContactMethod === ContactMethod.EXTERNAL_LINK ||
    contact.chosenContactMethod === ContactMethod.HH ||
    contact.chosenContactMethod === ContactMethod.SJ
  ) {
    return normalizeExternalUrl(value);
  }

  return null;
}

function normalizeExternalUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function externalContactValue(contact: VacancyContact) {
  if (contact.chosenContactMethod === ContactMethod.TELEGRAM) {
    return "Перейти в Telegram";
  }

  if (
    contact.chosenContactMethod === ContactMethod.HH ||
    contact.chosenContactMethod === ContactMethod.SJ ||
    contact.chosenContactMethod === ContactMethod.EXTERNAL_LINK
  ) {
    return "Перейти к отклику";
  }

  return contact.contactValue;
}

function resumeOptionLabel(resume: CandidateResume) {
  return (
    [resume.profession, resume.experienceName, resume.workFormatName]
      .filter(Boolean)
      .join(" - ") || `Резюме #${resume.id}`
  );
}

function resumeSummary(resume: CandidateResume) {
  const details = [
    resume.employmentName,
    resume.workFormatName,
    resume.city,
  ].filter(Boolean);

  if (details.length === 0) {
    return "Это резюме будет прикреплено к отклику.";
  }

  return `В отклике будет прикреплено: ${details.join(", ")}.`;
}

async function hasCandidateAppliedToVacancy(publicId: string) {
  const pageSize = 100;
  const firstPage = await getCandidateApplications(0, pageSize);

  if (
    firstPage.content.some(
      (application) => application.vacancyPublicId === publicId,
    )
  ) {
    return true;
  }

  for (let page = 1; page < firstPage.totalPages; page += 1) {
    const nextPage = await getCandidateApplications(page, pageSize);

    if (
      nextPage.content.some(
        (application) => application.vacancyPublicId === publicId,
      )
    ) {
      return true;
    }
  }

  return false;
}

function isAlreadyAppliedError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  const message = getServerMessage(error.data).toLowerCase();

  return error.status === 409 || message.includes("already exists");
}

function getApplyErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const message = getServerMessage(error.data).toLowerCase();

    if (message.includes("already exists")) {
      return "Вы уже откликались на эту вакансию.";
    }

    if (error.status === 409) {
      return "Вы уже откликались на эту вакансию.";
    }

    if (message.includes("active resume")) {
      return "Для отклика нужно создать активное резюме.";
    }

    if (message.includes("resume is required")) {
      return "Выберите резюме для отклика.";
    }

    if (error.status === 401) {
      return "Войдите в аккаунт, чтобы откликнуться.";
    }

    if (error.status === 403) {
      return "Отклик доступен только соискателям.";
    }

    if (error.status >= 500) {
      return "Не удалось отправить отклик из-за ошибки сервера.";
    }
  }

  return "Не удалось отправить отклик. Попробуйте ещё раз.";
}

function getServerMessage(data: unknown) {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail;

    if (typeof message === "string") {
      return message;
    }
  }

  return "";
}
