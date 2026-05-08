"use client";

import type { ReactNode } from "react";
import { Briefcase, Building2, Heart, MapPin, Monitor } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { VacancyResponseDto } from "@/app/types/api";

interface VacancyCardProps {
  vacancy: VacancyResponseDto;
  isFavorite?: boolean;
  onToggleFavorite?: (vacancyId: string) => void;
  onClickCard?: (vacancyId: string) => void;
}

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

function companyName(vacancy: VacancyResponseDto) {
  return vacancy.employer?.companyName || "Компания не указана";
}

function chipText(value?: string | null, fallback = "Не указано") {
  return value && value.trim() ? value : fallback;
}

export function VacancyCardNew({
  vacancy,
  isFavorite = false,
  onToggleFavorite,
  onClickCard,
}: VacancyCardProps) {
  const router = useRouter();

  function openVacancy() {
    onClickCard?.(vacancy.publicId);
    router.push(`/vacancies/${vacancy.publicId}`);
  }

  return (
    <article
      className="group cursor-pointer rounded-[8px] border border-[#d9d9d9] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bdbdbd] hover:shadow-[0_14px_32px_rgba(20,20,20,0.08)]"
      onClick={openVacancy}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[21px] font-black leading-tight tracking-normal text-[#050505]">
            {vacancy.title}
          </h3>

          {vacancy.employer?.id ? (
            <Link
              href={`/employers/${vacancy.employer.id}`}
              onClick={(event) => event.stopPropagation()}
              className="mt-1.5 inline-flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#777] hover:text-[#171717]"
            >
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{companyName(vacancy)}</span>
            </Link>
          ) : (
            <div className="mt-1.5 inline-flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#777]">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{companyName(vacancy)}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6f6f6f] transition hover:bg-[#f3f3f3] hover:text-red-600"
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite?.(vacancy.publicId);
          }}
        >
          <Heart
            className={`h-6 w-6 stroke-[2] ${
              isFavorite ? "fill-red-600 text-red-600" : ""
            }`}
          />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <InfoChip icon={<MapPin className="h-4 w-4" />}>
          {chipText(vacancy.city, "Город не указан")}
        </InfoChip>
        <InfoChip icon={<Monitor className="h-4 w-4" />}>
          {chipText(vacancy.workFormat?.name, "Формат не указан")}
        </InfoChip>
        <InfoChip icon={<Briefcase className="h-4 w-4" />}>
          {chipText(vacancy.experience?.name, "Опыт не указан")}
        </InfoChip>
      </div>

      <div className="mt-4 rounded-[8px] bg-[#f7f7f7] px-4 py-3">
        <p className="text-[13px] font-medium text-[#777]">Зарплата</p>
        <p className="mt-0.5 text-[23px] font-black leading-tight tracking-normal text-[#050505]">
          {formatSalary(vacancy)}
        </p>
      </div>
    </article>
  );
}

function InfoChip({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-[8px] bg-[#f8f8f8] px-3 py-1.5 text-[14px] font-semibold text-[#1f1f1f]">
      <span className="shrink-0 text-[#6f6f6f]">{icon}</span>
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}
