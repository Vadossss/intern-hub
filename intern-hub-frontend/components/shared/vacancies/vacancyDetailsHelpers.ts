import {
  ExternalLink,
  Globe,
  Mail,
  MessageSquareText,
  Phone,
  Send,
} from "lucide-react";

import {
  ContactMethod,
  type VacancyContact,
  type VacancyResponseDto,
} from "@/app/types/api";
import { ApiError } from "@/lib/api/client";
import {
  getCandidateApplications,
  type CandidateResume,
} from "@/lib/api/profile";

export const contactIcons = {
  EMAIL: Mail,
  PHONE: Phone,
  TELEGRAM: Send,
  HH: Globe,
  SJ: Globe,
  EXTERNAL_LINK: ExternalLink,
  INTERNAL_CHAT: MessageSquareText,
} as const;

export const contactLabels = {
  EMAIL: "Email",
  PHONE: "Телефон",
  TELEGRAM: "Telegram",
  HH: "HeadHunter",
  SJ: "SuperJob",
  EXTERNAL_LINK: "Внешняя ссылка",
  INTERNAL_CHAT: "Intern Hub",
} as const;

export function formatSalary(vacancy: VacancyResponseDto) {
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

export function buildContactHref(contact: VacancyContact) {
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

export function externalContactValue(contact: VacancyContact) {
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

export function resumeOptionLabel(resume: CandidateResume) {
  return (
    [resume.profession, resume.experienceName, resume.workFormatName]
      .filter(Boolean)
      .join(" - ") || `Резюме #${resume.id}`
  );
}

export function resumeSummary(resume: CandidateResume) {
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

export async function hasCandidateAppliedToVacancy(publicId: string) {
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

export function isAlreadyAppliedError(error: unknown) {
  if (!(error instanceof ApiError)) {
    return false;
  }

  const message = getServerMessage(error.data).toLowerCase();

  return error.status === 409 || message.includes("already exists");
}

export function getApplyErrorMessage(error: unknown) {
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

function normalizeExternalUrl(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
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
