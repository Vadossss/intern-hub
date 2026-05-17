"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, MessageCircle, Search, X } from "lucide-react";

import { ALL_VACANCIES_FILTER } from "@/components/shared/profile/constants";
import { statusLabel, vacancyHref } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployerApplication, EmployerVacancy } from "@/lib/api/profile";

type ApplicationsView = "active" | "accepted" | "rejected";

const applicationTabs: Array<{
  id: ApplicationsView;
  label: string;
  empty: string;
}> = [
  {
    id: "active",
    label: "Активные",
    empty: "Активных откликов по выбранному фильтру пока нет.",
  },
  {
    id: "accepted",
    label: "Приняты",
    empty: "Принятых откликов по выбранному фильтру пока нет.",
  },
  {
    id: "rejected",
    label: "Отказано",
    empty: "Отказов по выбранному фильтру пока нет.",
  },
];

export function EmployerApplicationsSection({
  applications,
  vacancies,
  selectedVacancy,
  onVacancyChange,
  onOpenCandidate,
  onStatusChange,
  onOpenChat,
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
  onOpenChat?: (chatId: string) => void;
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
  const applicationGroups: Record<ApplicationsView, EmployerApplication[]> = {
    active: filteredApplications.filter(isActiveApplication),
    accepted: filteredApplications.filter(isAcceptedApplication),
    rejected: filteredApplications.filter(isRejectedApplication),
  };
  const visibleApplications = applicationGroups[view];
  const activeTab = applicationTabs.find((tab) => tab.id === view);

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
        <div className="grid gap-2 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-1 sm:grid-cols-3">
          {applicationTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`rounded-xl px-4 py-3 text-left transition ${
                view === tab.id
                  ? "bg-[#171717] text-white shadow-sm"
                  : "text-[#555] hover:bg-white"
              }`}
              onClick={() => setView(tab.id)}
            >
              <span className="block text-sm font-extrabold">
                {tab.label}
              </span>
              <span
                className={`mt-1 block text-xs ${
                  view === tab.id ? "text-white/65" : "text-[#777]"
                }`}
              >
                {applicationGroups[tab.id].length} откликов
              </span>
            </button>
          ))}
        </div>

        {visibleApplications.length > 0 ? (
          visibleApplications.map((application) => {
            const vacancy = vacancyById.get(application.vacancyPublicId);
            const isResolved =
              view !== "active" ||
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
                  {application.chatId ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenChat?.(application.chatId as string)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Открыть чат
                    </Button>
                  ) : null}
                  {!isResolved ? (
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
            {activeTab?.empty ?? "Откликов по выбранному фильтру пока нет."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function isAcceptedApplication(application: EmployerApplication) {
  return application.status === "ACCEPTED";
}

function isRejectedApplication(application: EmployerApplication) {
  return (
    application.status === "REJECTED" ||
    (Boolean(application.archived) && application.status !== "ACCEPTED")
  );
}

function isActiveApplication(application: EmployerApplication) {
  return (
    !isAcceptedApplication(application) && !isRejectedApplication(application)
  );
}
