import type { PublicCandidateProfile } from "@/lib/api/candidates";
import type { CandidateResume } from "@/lib/api/profile";

export function getFullName(candidate: PublicCandidateProfile) {
  const fullName = [candidate.firstName, candidate.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "Соискатель";
}

export function formatBirthday(value?: string | null) {
  if (!value) {
    return "Дата рождения не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatExpectedSalary(resume?: CandidateResume) {
  const from = resume?.expectedSalaryFrom;
  const to = resume?.expectedSalaryTo;

  if (from && to) {
    return `${from.toLocaleString("ru-RU")} - ${to.toLocaleString("ru-RU")} ₽`;
  }

  if (from) {
    return `от ${from.toLocaleString("ru-RU")} ₽`;
  }

  if (to) {
    return `до ${to.toLocaleString("ru-RU")} ₽`;
  }

  return "Ожидания не указаны";
}
