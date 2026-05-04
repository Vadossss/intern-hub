"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Wallet,
} from "lucide-react";

import type { VacancyContact, VacancyResponseDto } from "@/app/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVacancyById } from "@/lib/api/vacancies";

const contactIcons = {
  EMAIL: Mail,
  PHONE: Phone,
  TELEGRAM: Sparkles,
  HH: Globe,
  SJ: Globe,
  EXTERNAL_LINK: ArrowUpRight,
  INTERNAL_CHAT: Briefcase,
} as const;

const contactLabels = {
  EMAIL: "Email",
  PHONE: "Телефон",
  TELEGRAM: "Telegram",
  HH: "HeadHunter",
  SJ: "SuperJob",
  EXTERNAL_LINK: "Внешняя ссылка",
  INTERNAL_CHAT: "Внутренний чат",
} as const;

function formatSalary(vacancy: VacancyResponseDto) {
  const currency = vacancy.currency?.abbr ?? "";

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom.toLocaleString("ru-RU")} — ${vacancy.salaryTo.toLocaleString("ru-RU")} ${currency}`;
  }

  if (vacancy.salaryFrom) {
    return `от ${vacancy.salaryFrom.toLocaleString("ru-RU")} ${currency}`;
  }

  if (vacancy.salaryTo) {
    return `до ${vacancy.salaryTo.toLocaleString("ru-RU")} ${currency}`;
  }

  return "Зарплата не указана";
}

function getStatusLabel(status: VacancyResponseDto["status"]) {
  switch (status) {
    case "ACTIVE":
      return "Активна";
    case "MODERATED":
      return "На модерации";
    case "ARCHIVED":
      return "В архиве";
    default:
      return status;
  }
}

function buildContactHref(contact: VacancyContact) {
  if (contact.chosenContactMethod === "EMAIL") {
    return `mailto:${contact.contactValue}`;
  }

  if (contact.chosenContactMethod === "PHONE") {
    return `tel:${contact.contactValue}`;
  }

  if (
    contact.chosenContactMethod === "EXTERNAL_LINK" ||
    contact.chosenContactMethod === "HH" ||
    contact.chosenContactMethod === "SJ" ||
    contact.chosenContactMethod === "TELEGRAM"
  ) {
    return contact.contactValue;
  }

  return null;
}

export function VacancyDetailsPage() {
  const params = useParams();
  const publicId = params.publicId as string;

  const [vacancy, setVacancy] = useState<VacancyResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadVacancy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getVacancyById(publicId);

        if (active) {
          setVacancy(response);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить вакансию",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (publicId) {
      loadVacancy();
    }

    return () => {
      active = false;
    };
  }, [publicId]);

  const infoItems = useMemo(() => {
    if (!vacancy) {
      return [];
    }

    return [
      {
        label: "Формат работы",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-10 w-52 rounded-xl bg-[#e6e2d8]" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-64 rounded-[2rem] bg-[#e6e2d8]" />
            <div className="h-64 rounded-[2rem] bg-[#d8d4ca]" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="h-[32rem] rounded-[2rem] bg-[#e6e2d8]" />
            <div className="h-[32rem] rounded-[2rem] bg-[#e6e2d8]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vacancy) {
    return (
      <div className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-red-200 bg-white/80 p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#171717]">
            Вакансия недоступна
          </h1>
          <p className="mt-3 text-[#5b5b5b]">
            {error ?? "Не удалось получить данные вакансии."}
          </p>
          <Button
            asChild
            className="mt-6 rounded-xl bg-[#171717] text-white hover:bg-black"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться на главную
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#d8e7d6] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-[#f0d6b8] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[20rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#dbe3f5] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <Button
          asChild
          variant="ghost"
          className="mb-6 rounded-xl text-[#4a4a4a] hover:bg-white/60"
        >
          <Link href={`/${vacancy.stack.toLowerCase()}/jobs`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к вакансиям
          </Link>
        </Button>

        <section className="grid gap-6 items-start lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#161616]/10 bg-[#faf8f2]/90 p-6 shadow-[0_18px_70px_rgba(20,20,20,0.08)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full bg-[#edf3ea] px-3 py-1 text-[#3f5f4a] hover:bg-[#edf3ea]">
                {vacancy.stack}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-[#161616]/15 bg-white text-[#4c4c4c]"
              >
                {getStatusLabel(vacancy.status)}
              </Badge>
              {vacancy.employer?.verified ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 text-amber-700"
                >
                  Проверенный работодатель
                </Badge>
              ) : null}
            </div>

            <h1 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-tight text-[#171717] sm:text-4xl">
              {vacancy.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#565656]">
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#8a8a8a]" />
                {vacancy.employer?.companyName ?? "Компания не указана"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#8a8a8a]" />
                {vacancy.city || "Локация не указана"}
              </span>
            </div>

            <div
              dangerouslySetInnerHTML={{ __html: vacancy.description }}
              className="mt-6 whitespace-pre-line text-sm leading-7 text-[#575757] sm:text-base"
            ></div>
          </div>

          <div>
            <div className="rounded-[2rem] mb-5 border border-[#161616]/10 bg-[#171717] p-6 text-white shadow-[0_20px_80px_rgba(30,30,30,0.18)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                Условия
              </p>
              <p className="mt-2 text-3xl font-bold">{formatSalary(vacancy)}</p>

              <div className="mt-6 space-y-3">
                {infoItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/5 p-4"
                    >
                      <div className="rounded-lg bg-white/10 p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/60">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(20,20,20,0.08)] backdrop-blur">
              <h2 className="text-xl font-semibold text-[#171717]">
                Контакты и отклик
              </h2>

              <div className="mt-5 space-y-3">
                {vacancy.contacts?.length ? (
                  vacancy.contacts.map((contact, index) => {
                    const Icon =
                      contactIcons[contact.chosenContactMethod] ?? ArrowUpRight;
                    const href = buildContactHref(contact);

                    const content = (
                      <div className="flex items-start gap-3 rounded-xl border border-[#161616]/12 bg-white p-4 transition hover:border-[#3f5f4a]/45 hover:bg-[#f8faf7]">
                        <div className="rounded-lg bg-[#edf3ea] p-2 text-[#3f5f4a]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#777]">
                            {contactLabels[contact.chosenContactMethod]}
                          </p>
                          <p className="mt-1 break-all text-sm font-medium text-[#171717]">
                            {contact.contactValue}
                          </p>
                          {contact.hint ? (
                            <p className="mt-1 text-xs text-[#6a6a6a]">
                              {contact.hint}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );

                    if (!href) {
                      return (
                        <div key={`${contact.contactValue}-${index}`}>
                          {content}
                        </div>
                      );
                    }

                    return (
                      <a
                        key={`${contact.contactValue}-${index}`}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        {content}
                      </a>
                    );
                  })
                ) : (
                  <p className="text-sm text-[#666]">
                    Контакты для отклика пока не добавлены.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(20,20,20,0.08)] backdrop-blur">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-[#171717]">
                Ключевые навыки
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {vacancy.skills?.length ? (
                  vacancy.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="rounded-full border-[#161616]/15 bg-white px-3 py-1.5 text-[#4b4b4b]"
                    >
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[#6a6a6a]">Навыки не указаны.</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/70 p-6 shadow-[0_12px_40px_rgba(20,20,20,0.08)] backdrop-blur">
              <div className="flex items-start gap-3 rounded-xl border border-[#d7e8d7] bg-[#edf3ea] p-4 text-sm text-[#34533a]">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <p>
                  Проверьте детали вакансии и используйте удобный канал связи в
                  блоке контактов справа.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
