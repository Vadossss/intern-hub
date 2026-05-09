"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Pencil, Plus } from "lucide-react";

import { statusLabel, vacancyHref } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployerVacancy } from "@/lib/api/profile";

type VacancyTab = "active" | "review" | "archived";

const vacancyTabs: Array<{ id: VacancyTab; label: string; empty: string }> = [
  {
    id: "active",
    label: "Активные",
    empty: "Активных вакансий пока нет.",
  },
  {
    id: "review",
    label: "На проверке",
    empty: "Вакансий на проверке пока нет.",
  },
  {
    id: "archived",
    label: "В архиве",
    empty: "В архиве пока нет вакансий.",
  },
];

export function EmployerVacanciesSection({
  vacancies,
  onOpenApplications,
}: {
  vacancies: EmployerVacancy[];
  onOpenApplications: (publicId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<VacancyTab>("active");
  const vacancyGroups = useMemo(
    () => ({
      active: vacancies.filter(isActiveVacancy),
      review: vacancies.filter(isReviewVacancy),
      archived: vacancies.filter(isArchivedVacancy),
    }),
    [vacancies],
  );
  const visibleVacancies = vacancyGroups[activeTab];
  const activeTabConfig = vacancyTabs.find((tab) => tab.id === activeTab);

  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Вакансии</CardTitle>
          <Button asChild className="w-fit rounded-xl bg-[#171717] text-white">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              Создать вакансию
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-1 sm:grid-cols-3">
          {vacancyTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-xl px-4 py-3 text-left transition ${
                activeTab === tab.id
                  ? "bg-[#171717] text-white shadow-sm"
                  : "text-[#555] hover:bg-white"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="block text-sm font-extrabold">{tab.label}</span>
              <span
                className={`mt-1 block text-xs ${
                  activeTab === tab.id ? "text-white/65" : "text-[#777]"
                }`}
              >
                {vacancyGroups[tab.id].length} вакансий
              </span>
            </button>
          ))}
        </div>

        {visibleVacancies.length ? (
          visibleVacancies.map((vacancy) => (
            <div
              key={vacancy.publicId}
              className="rounded-2xl border bg-white p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-semibold text-[#171717]">
                    {vacancy.title}
                  </p>
                  <p className="mt-1 text-sm text-[#626262]">
                    {[vacancy.stack, vacancy.city]
                      .filter(Boolean)
                      .join(" • ") || "Детали не указаны"}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {statusLabel(vacancy.status)}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenApplications(vacancy.publicId)}
                >
                  Отклики
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={vacancyHref(vacancy.publicId)}>
                    <ArrowUpRight className="h-4 w-4" />
                    Открыть
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/create?vacancy=${vacancy.publicId}`}>
                    <Pencil className="h-4 w-4" />
                    Редактировать
                  </Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="rounded-2xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] p-6 text-sm text-[#626262]"
          >
            {activeTabConfig?.empty}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function normalizedStatus(status?: string) {
  return status?.toUpperCase() ?? "";
}

function isActiveVacancy(vacancy: EmployerVacancy) {
  return ["ACTIVE", "APPROVED"].includes(normalizedStatus(vacancy.status));
}

function isArchivedVacancy(vacancy: EmployerVacancy) {
  return normalizedStatus(vacancy.status) === "ARCHIVED";
}

function isReviewVacancy(vacancy: EmployerVacancy) {
  return !isActiveVacancy(vacancy) && !isArchivedVacancy(vacancy);
}
