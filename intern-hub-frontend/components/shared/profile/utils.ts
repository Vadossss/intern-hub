import {
  ALL_VACANCIES_FILTER,
  PROFILE_SECTION_PARAM,
  VACANCY_FILTER_PARAM,
} from "@/components/shared/profile/constants";
import type {
  CandidateSection,
  EmployerSection,
  ProfileSection,
} from "@/components/shared/profile/types";

export function labelFrom(map: Record<string, string>, value?: string) {
  return value ? (map[value] ?? value) : "Не указано";
}

export function textValue(value?: FormDataEntryValue | string | number | null) {
  return value === undefined || value === null ? "" : String(value);
}

export function numberValue(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function formatMoney(from?: number, to?: number) {
  if (!from && !to) return "Не указано";
  if (from && to)
    return `${from.toLocaleString("ru-RU")} - ${to.toLocaleString("ru-RU")} ₽`;
  if (from) return `от ${from.toLocaleString("ru-RU")} ₽`;
  return `до ${to?.toLocaleString("ru-RU")} ₽`;
}

export function formatDate(value?: string) {
  if (!value) return "Недавно";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Активна",
    DRAFT: "Черновик",
    ARCHIVED: "Архив",
    PENDING: "На рассмотрении",
    ACCEPTED: "Принят",
    REJECTED: "Отклонен",
  };

  return labels[status ?? ""] ?? status ?? "Без статуса";
}

export function vacancyHref(publicId?: string) {
  return publicId ? `/vacancies/${publicId}` : "/vacancies";
}

export function employerHref(companyName?: string) {
  return companyName
    ? `/vacancies?companyName=${encodeURIComponent(companyName)}`
    : "/vacancies";
}

export function profileSectionHref(
  section: ProfileSection,
  vacancyPublicId?: string,
) {
  const params = new URLSearchParams({ [PROFILE_SECTION_PARAM]: section });

  if (
    section === "applications" &&
    vacancyPublicId &&
    vacancyPublicId !== ALL_VACANCIES_FILTER
  ) {
    params.set(VACANCY_FILTER_PARAM, vacancyPublicId);
  }

  return `/profile?${params.toString()}`;
}

export function isCandidateSection(
  value: string | null,
): value is CandidateSection {
  return (
    value === "profile" || value === "applications" || value === "favorites"
  );
}

export function isEmployerSection(
  value: string | null,
): value is EmployerSection {
  return (
    value === "profile" || value === "vacancies" || value === "applications"
  );
}
