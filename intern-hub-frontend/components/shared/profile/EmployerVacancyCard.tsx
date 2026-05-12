"use client";

import Link from "next/link";
import { Eye, Loader2, Pencil } from "lucide-react";

import { statusLabel, vacancyHref } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EmployerVacancy } from "@/lib/api/profile";

function badgeItems(vacancy: EmployerVacancy) {
  return [
    vacancy.direction ? { label: vacancy.direction } : null,
    vacancy.city ? { label: vacancy.city } : null,
    vacancy.experience?.name ? { label: vacancy.experience.name } : null,
    vacancy.workFormat?.name ? { label: vacancy.workFormat.name } : null,
    vacancy.employment?.name ? { label: vacancy.employment.name } : null,
  ].filter(Boolean) as Array<{ label: string }>;
}

export function EmployerVacancyCard({
  vacancy,
  isLoading,
  onEdit,
  onOpenApplications,
}: {
  vacancy: EmployerVacancy;
  isLoading: boolean;
  onEdit: (vacancy: EmployerVacancy) => void;
  onOpenApplications: (publicId: string) => void;
}) {
  const details = badgeItems(vacancy);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href={vacancyHref(vacancy.publicId)}
            className="font-semibold text-[#171717] underline-offset-4 hover:underline"
          >
            {vacancy.title}
          </Link>
          {details.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
                {details.map((item, index) => (
                  <Badge
                    key={`${item.label}-${index}`}
                  variant="outline"
                  className="rounded-lg bg-[#f7f7f3] text-[#444]"
                >
                  {item.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#626262]">Детали не указаны</p>
          )}
        </div>
        <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
          {statusLabel(vacancy.status)}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
          <Eye className="h-3.5 w-3.5" />
          {vacancy.viewCount ?? 0}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenApplications(vacancy.publicId)}
        >
          Отклики
        </Button>
          <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onEdit(vacancy)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
          Редактировать
        </Button>
      </div>
    </div>
  );
}
