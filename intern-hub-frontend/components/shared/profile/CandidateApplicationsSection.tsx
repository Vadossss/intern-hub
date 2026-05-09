"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import {
  employerHref,
  formatDate,
  statusLabel,
  vacancyHref,
} from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationHistory } from "@/lib/api/profile";

type ApplicationsView = "active" | "archive";

export function CandidateApplicationsSection({
  applications,
}: {
  applications: CandidateApplicationHistory[];
}) {
  const [view, setView] = useState<ApplicationsView>("active");
  const activeApplications = applications.filter(
    (application) =>
      !application.archived &&
      application.status !== "ACCEPTED" &&
      application.status !== "REJECTED",
  );
  const archivedApplications = applications.filter(
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
        <CardTitle>Мои отклики</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {applications.length > 0 ? (
          <>
            <ApplicationsSwitch
              view={view}
              activeCount={activeApplications.length}
              archiveCount={archivedApplications.length}
              onChange={setView}
            />
            <ApplicationGroup
              title={view === "active" ? "Активные отклики" : "Архив откликов"}
              applications={visibleApplications}
              archived={view === "archive"}
            />
          </>
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
            Откликов пока нет.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsSwitch({
  view,
  activeCount,
  archiveCount,
  onChange,
}: {
  view: ApplicationsView;
  activeCount: number;
  archiveCount: number;
  onChange: (view: ApplicationsView) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border bg-white p-1">
      <Button
        type="button"
        size="sm"
        variant={view === "active" ? "default" : "ghost"}
        className={view === "active" ? "bg-[#171717] text-white" : ""}
        onClick={() => onChange("active")}
      >
        Активные
        <Badge variant="outline" className="ml-2 rounded-lg bg-white/80">
          {activeCount}
        </Badge>
      </Button>
      <Button
        type="button"
        size="sm"
        variant={view === "archive" ? "default" : "ghost"}
        className={view === "archive" ? "bg-[#171717] text-white" : ""}
        onClick={() => onChange("archive")}
      >
        Архив
        <Badge variant="outline" className="ml-2 rounded-lg bg-white/80">
          {archiveCount}
        </Badge>
      </Button>
    </div>
  );
}

function ApplicationGroup({
  title,
  applications,
  archived = false,
}: {
  title: string;
  applications: CandidateApplicationHistory[];
  archived?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#626262]">
          {title}
        </h3>
        <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
          {applications.length}
        </Badge>
      </div>

      {applications.length > 0 ? (
        applications.map((application) => (
          <ApplicationCard
            key={application.applicationId}
            application={application}
            archived={archived}
          />
        ))
      ) : (
        <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
          {archived
            ? "Работодатель пока не ответил ни на один отклик."
            : "Активных откликов пока нет."}
        </p>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  archived,
}: {
  application: CandidateApplicationHistory;
  archived: boolean;
}) {
  const employerName = application.employer?.companyName || "Работодатель";

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={vacancyHref(application.vacancyPublicId)}>
            <p className="inline-flex items-center gap-2 font-medium text-[#3f5f4a] hover:underline">
              {application.vacancyTitle}
              <ArrowUpRight className="h-4 w-4" />
            </p>
          </Link>
          <Link
            href={employerHref(employerName)}
            className="mt-1 inline-flex items-center gap-1 text-sm text-[#626262] hover:underline"
          >
            {employerName}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <Badge
          variant="outline"
          className={
            archived ? "rounded-lg bg-[#f7f7f3] text-[#777]" : "rounded-lg bg-white"
          }
        >
          {statusLabel(application.status)}
        </Badge>
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-[#777]">
        <Clock3 className="h-4 w-4" />
        Отклик от {formatDate(application.appliedAt)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={vacancyHref(application.vacancyPublicId)}>
            Вакансия
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={employerHref(employerName)}>
            Работодатель
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
