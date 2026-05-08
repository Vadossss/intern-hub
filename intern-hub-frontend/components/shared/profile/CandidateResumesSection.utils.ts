import type { CandidateResume, CandidateResumePayload } from "@/lib/api/profile";

import type { ResumeFormErrors } from "@/components/shared/profile/CandidateResumesSection.types";

export function getDefaultResumeId(resumes: CandidateResume[]) {
  return resumes.find((resume) => !resume.archived)?.id ?? resumes[0]?.id ?? null;
}

export function validateResumePayload(payload: CandidateResumePayload) {
  const errors: ResumeFormErrors = {};

  if (!payload.profession?.trim()) {
    errors.profession = "Укажите профессию.";
  }

  if (!payload.experienceId) {
    errors.experienceId = "Выберите опыт работы.";
  }

  if (!payload.employmentId) {
    errors.employmentId = "Выберите тип занятости.";
  }

  if (!payload.workFormatId) {
    errors.workFormatId = "Выберите формат работы.";
  }

  if (!htmlToText(payload.about).trim()) {
    errors.about = "Заполните описание резюме.";
  }

  if (!payload.skillIds?.length) {
    errors.skillIds = "Выберите хотя бы один навык.";
  }

  return errors;
}

export function hasFormErrors(errors: ResumeFormErrors) {
  return Object.values(errors).some(Boolean);
}

export function fieldControlClass(error?: string) {
  return error
    ? "border-red-500 bg-red-50/70 focus-visible:border-red-500 focus-visible:ring-red-200 focus:border-red-500 focus:ring-red-200"
    : "";
}

export function fieldPanelClass(error?: string) {
  return error ? "border-red-500 bg-red-50/50" : "";
}

function htmlToText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
