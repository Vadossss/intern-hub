"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Search, X } from "lucide-react";

import { ALL_VACANCIES_FILTER } from "@/components/shared/profile/constants";
import { statusLabel, vacancyHref } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployerApplication, EmployerVacancy } from "@/lib/api/profile";

type ApplicationsView = "active" | "archive";

export function EmployerApplicationsSection({
  applications,
  vacancies,
  selectedVacancy,
  onVacancyChange,
  onOpenCandidate,
  onStatusChange,
}: {
  applications: EmployerApplication[];
  vacancies: EmployerVacancy[];
  selectedVacancy: string;
  onVacancyChange: (publicId: string) => void;
  onOpenCandidate: (candidateId: number) => void;
  onStatusChange: (
    applicationId: number,
    status: "ACCEPTED" | "REJECTED",
  ) => void;
}) {
  const [view, setView] = useState<ApplicationsView>("active");
  const vacancyById = new Map(
    vacancies.map((vacancy) => [vacancy.publicId, vacancy]),
  );
  const filteredApplications =
    selectedVacancy === ALL_VACANCIES_FILTER
      ? applications
      : applications.filter(
          (application) => application.vacancyPublicId === selectedVacancy,
        );
  const activeApplications = filteredApplications.filter(
    (application) =>
      !application.archived &&
      application.status !== "ACCEPTED" &&
      application.status !== "REJECTED",
  );
  const archivedApplications = filteredApplications.filter(
    (application) =>
      application.archived ||
      application.status === "ACCEPTED" ||
      application.status === "REJECTED",
  );
  const visibleApplications =
    view === "active" ? activeApplications : archivedApplications;

  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Отклики</CardTitle>
          <select
            value={selectedVacancy}
            onChange={(event) => onVacancyChange(event.target.value)}
            className="h-10 rounded-md border bg-white px-3 text-sm"
          >
            <option value={ALL_VACANCIES_FILTER}>Все вакансии</option>
            {vacancies.map((vacancy) => (
              <option key={vacancy.publicId} value={vacancy.publicId}>
                {vacancy.title}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="inline-flex rounded-xl border bg-white p-1">
          <Button
            type="button"
            size="sm"
            variant={view === "active" ? "default" : "ghost"}
            className={view === "active" ? "bg-[#171717] text-white" : ""}
            onClick={() => setView("active")}
          >
            Активные
            <Badge variant="outline" className="ml-2 rounded-lg bg-white/80">
              {activeApplications.length}
            </Badge>
          </Button>
          <Button
            type="button"
            size="sm"
            variant={view === "archive" ? "default" : "ghost"}
            className={view === "archive" ? "bg-[#171717] text-white" : ""}
            onClick={() => setView("archive")}
          >
            Архив
            <Badge variant="outline" className="ml-2 rounded-lg bg-white/80">
              {archivedApplications.length}
            </Badge>
          </Button>
        </div>

        {visibleApplications.length > 0 ? (
          visibleApplications.map((application) => {
            const vacancy = vacancyById.get(application.vacancyPublicId);
            const isArchived =
              view === "archive" ||
              application.archived ||
              application.status === "ACCEPTED" ||
              application.status === "REJECTED";

            return (
              <div
                key={application.applicationId}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <Link
                      href={`/candidate/${application.candidateId}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#171717] hover:text-[#48644d] hover:underline"
                    >
                      {application.candidateName || "Кандидат"}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <p className="mt-1 text-sm text-[#626262]">
                      {application.candidateEmail}
                    </p>
                    <Link
                      href={vacancyHref(application.vacancyPublicId)}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#48644d] hover:underline"
                    >
                      {vacancy?.title ?? "Открыть вакансию"}
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    {application.resumeProfession ? (
                      <p className="mt-2 text-sm font-semibold text-[#48644d]">
                        Резюме: {application.resumeProfession}
                      </p>
                    ) : application.resumeUrl ? (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#48644d] hover:underline"
                      >
                        Ссылка на резюме
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : null}
                    {application.coverLetter ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
                        {application.coverLetter}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                    {statusLabel(application.status)}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCandidate(application.candidateId)}
                  >
                    <Search className="h-4 w-4" />
                    Профиль
                  </Button>
                  {!isArchived ? (
                    <>
                      <Button
                        size="sm"
                        className="bg-[#48644d] text-white hover:bg-[#3b543f]"
                        onClick={() =>
                          onStatusChange(application.applicationId, "ACCEPTED")
                        }
                      >
                        <Check className="h-4 w-4" />
                        Принять
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onStatusChange(application.applicationId, "REJECTED")
                        }
                      >
                        <X className="h-4 w-4" />
                        Отклонить
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
            {view === "active"
              ? "Активных откликов по выбранному фильтру пока нет."
              : "В архиве по выбранному фильтру пока нет откликов."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
