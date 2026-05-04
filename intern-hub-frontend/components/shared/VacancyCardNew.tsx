"use client";

import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Clock3,
  DollarSign,
  MapPin,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { VacancyResponseDto } from "@/app/types/api";
import { Badge } from "@/components/ui/badge";

interface VacancyCardProps {
  vacancy: VacancyResponseDto;
  isFavorite?: boolean;
  onToggleFavorite?: (vacancyId: string) => void;
  onClickCard?: (vacancyId: string) => void;
}

function formatSalary(vacancy: VacancyResponseDto) {
  const { salaryFrom, salaryTo, currency } = vacancy;
  const currencySymbol = currency?.abbr ?? "";

  if (salaryFrom && salaryTo) {
    return `${salaryFrom.toLocaleString("ru-RU")} — ${salaryTo.toLocaleString("ru-RU")} ${currencySymbol}`;
  }

  if (salaryFrom) {
    return `от ${salaryFrom.toLocaleString("ru-RU")} ${currencySymbol}`;
  }

  if (salaryTo) {
    return `до ${salaryTo.toLocaleString("ru-RU")} ${currencySymbol}`;
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

export function VacancyCardNew({
  vacancy,
  isFavorite = false,
  onToggleFavorite,
  onClickCard,
}: VacancyCardProps) {
  const router = useRouter();

  return (
    <article
      className="group relative overflow-hidden rounded-[1.5rem] border border-[#161616]/12 bg-[#faf8f2]/90 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#3f5f4a]/45 hover:shadow-[0_18px_40px_rgba(20,20,20,0.1)]"
      onClick={() => {
        onClickCard?.(vacancy.publicId);
        router.push(`/vacancies/${vacancy.publicId}`);
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,231,214,0.9),transparent_32%)] opacity-0 transition group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
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

            <h3 className="mt-4 line-clamp-2 text-xl font-semibold tracking-tight text-[#171717] sm:text-2xl">
              {vacancy.title}
            </h3>
          </div>

          {onToggleFavorite ? (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite(vacancy.publicId);
              }}
              className="rounded-full border border-[#161616]/15 bg-white p-2.5 text-[#8b8b8b] transition hover:border-amber-300 hover:text-amber-500"
              aria-label="Добавить в избранное"
            >
              <Star
                className={`h-5 w-5 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`}
              />
            </button>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#565656]">
          <span className="inline-flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#8a8a8a]" />
            {vacancy.employer?.companyName ?? "Компания не указана"}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8a8a8a]" />
            {vacancy.city || "Локация не указана"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#161616]/10 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-sm text-[#6a6a6a]">
              <DollarSign className="h-4 w-4" />
              Условия
            </div>
            <p className="mt-2 text-lg font-semibold text-[#171717]">
              {formatSalary(vacancy)}
            </p>
          </div>

          <div className="rounded-xl border border-[#161616]/10 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-sm text-[#6a6a6a]">
              <Clock3 className="h-4 w-4" />
              Формат и опыт
            </div>
            <p className="mt-2 text-sm font-medium text-[#171717]">
              {vacancy.experience?.name ?? "Опыт не указан"}
            </p>
            <p className="mt-1 text-sm text-[#606060]">
              {vacancy.workFormat?.name ?? "Формат не указан"}
              {vacancy.employment?.name ? ` • ${vacancy.employment.name}` : ""}
            </p>
          </div>
        </div>

        {/* <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#575757]">
          {vacancy.description}
        </p> */}

        <div className="mt-5 flex flex-wrap gap-2">
          {vacancy.skills?.length ? (
            <>
              {vacancy.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full border border-[#161616]/12 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#4b4b4b]"
                >
                  {skill.name}
                </span>
              ))}
              {vacancy.skills.length > 5 ? (
                <span className="rounded-full border border-[#161616]/12 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#7a7a7a]">
                  +{vacancy.skills.length - 5}
                </span>
              ) : null}
            </>
          ) : (
            <span className="rounded-full border border-dashed border-[#161616]/20 px-3 py-1.5 text-xs text-[#7a7a7a]">
              Навыки не указаны
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#161616]/8 pt-4 text-sm">
          <div className="inline-flex items-center gap-2 text-[#666]">
            <Briefcase className="h-4 w-4" />
            Открыть карточку вакансии
          </div>
          <div className="inline-flex items-center font-semibold text-[#3f5f4a]">
            Подробнее
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </div>
        </div>
      </div>
    </article>
  );
}
