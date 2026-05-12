"use client";

import { memo } from "react";
import type { ComponentType, CSSProperties, SVGProps } from "react";
import {
  Briefcase,
  Building2,
  Eye,
  Heart,
  MapPin,
  Monitor,
} from "lucide-react";
import Link from "next/link";

import { VacancyResponseDto } from "@/app/types/api";

interface VacancyCardProps {
  vacancy: VacancyResponseDto;
  isFavorite?: boolean;
  onToggleFavorite?: (vacancyId: string) => void;
}

const cardRenderStyle: CSSProperties = {
  containIntrinsicSize: "220px",
  contentVisibility: "auto",
};

function formatSalary(vacancy: VacancyResponseDto) {
  const { salaryFrom, salaryTo, currency } = vacancy;
  const currencySymbol = currency?.abbr || "₽";

  if (salaryFrom && salaryTo) {
    return `${salaryFrom.toLocaleString("ru-RU")} - ${salaryTo.toLocaleString("ru-RU")} ${currencySymbol}`;
  }

  if (salaryFrom) {
    return `от ${salaryFrom.toLocaleString("ru-RU")} ${currencySymbol}`;
  }

  if (salaryTo) {
    return `до ${salaryTo.toLocaleString("ru-RU")} ${currencySymbol}`;
  }

  return "Не указана";
}

function getCompanyName(vacancy: VacancyResponseDto) {
  return vacancy.employer?.companyName || "Компания не указана";
}

function chipText(value?: string | null, fallback = "Не указано") {
  return value && value.trim() ? value : fallback;
}

export const VacancyCardNew = memo(function VacancyCardNew({
  vacancy,
  isFavorite = false,
  onToggleFavorite,
}: VacancyCardProps) {
  const vacancyHref = `/vacancies/${vacancy.publicId}`;
  const employerHref = vacancy.employer?.id
    ? `/employers/${vacancy.employer.id}`
    : null;
  const employerName = getCompanyName(vacancy);
  const salary = formatSalary(vacancy);
  const city = chipText(vacancy.city, "Город не указан");
  const workFormat = chipText(vacancy.workFormat?.name, "Формат не указан");
  const experience = chipText(vacancy.experience?.name, "Опыт не указан");

  return (
    <article
      className="group relative cursor-pointer rounded-[8px] border border-[#d9d9d9] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bdbdbd] hover:shadow-[0_14px_32px_rgba(20,20,20,0.08)]"
      style={cardRenderStyle}
    >
      <Link
        href={vacancyHref}
        prefetch={false}
        aria-label={`Открыть вакансию ${vacancy.title}`}
        className="absolute inset-0 z-10 rounded-[8px]"
      />

      <div className="flex items-start justify-between gap-4">
        <div className="pointer-events-none relative z-20 min-w-0">
          <h3 className="line-clamp-2 text-[21px] font-black leading-tight tracking-normal text-[#050505]">
            {vacancy.title}
          </h3>

          {employerHref ? (
            <Link
              href={employerHref}
              prefetch={false}
              className="pointer-events-auto mt-1.5 inline-flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#777] hover:text-[#171717]"
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{employerName}</span>
            </Link>
          ) : (
            <div className="mt-1.5 inline-flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#777]">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{employerName}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="relative z-20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6f6f6f] transition hover:bg-[#f3f3f3] hover:text-red-600"
          aria-label={
            isFavorite ? "Удалить из избранного" : "Добавить в избранное"
          }
          onClick={() => onToggleFavorite?.(vacancy.publicId)}
        >
          <Heart
            className={`h-6 w-6 stroke-[2] ${
              isFavorite ? "fill-red-600 text-red-600" : ""
            }`}
          />
        </button>
      </div>

      <div className="pointer-events-none relative z-20 mt-4 flex flex-wrap gap-2">
        <InfoChip icon={MapPin}>{city}</InfoChip>
        <InfoChip icon={Monitor}>{workFormat}</InfoChip>
        <InfoChip icon={Briefcase}>{experience}</InfoChip>
      </div>

      <div className="pointer-events-none relative z-20 mt-4 rounded-[8px] bg-[#f7f7f7] px-4 py-3">
        <p className="text-[13px] font-medium text-[#777]">Зарплата</p>
        <p className="mt-0.5 text-[23px] font-black leading-tight tracking-normal text-[#050505]">
          {salary}
        </p>
      </div>
    </article>
  );
});

function InfoChip({
  icon,
  children,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children: string;
}) {
  const Icon = icon;

  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-[8px] bg-[#f8f8f8] px-3 py-1.5 text-[14px] font-semibold text-[#1f1f1f]">
      <Icon className="h-4 w-4 shrink-0 text-[#6f6f6f]" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}
