import Link from "next/link";
import { ArrowUpRight, Check, Search, X } from "lucide-react";

import { ALL_VACANCIES_FILTER } from "@/components/profile/constants";
import { statusLabel, vacancyHref } from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployerApplication, EmployerVacancy } from "@/lib/api/profile";

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
  const vacancyById = new Map(
    vacancies.map((vacancy) => [vacancy.publicId, vacancy]),
  );
  const filteredApplications =
    selectedVacancy === ALL_VACANCIES_FILTER
      ? applications
      : applications.filter(
          (application) => application.vacancyPublicId === selectedVacancy,
        );

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
      <CardContent className="space-y-3">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => {
            const vacancy = vacancyById.get(application.vacancyPublicId);

            return (
              <div
                key={application.applicationId}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="font-semibold text-[#171717]">
                      {application.candidateName}
                    </p>
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
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
            Откликов по выбранному фильтру пока нет.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
