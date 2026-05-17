"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";

import {
  employerHref,
  formatDate,
  formatMoney,
  statusLabel,
  vacancyHref,
} from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationHistory } from "@/lib/api/profile";
import { Georama } from "next/font/google";

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
  const employerUrl = application.employer?.id
    ? `/employers/${application.employer.id}`
    : employerHref(employerName);
  const badges = applicationBadgeLabels(application);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 mb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={vacancyHref(application.vacancyPublicId)}>
            <p className="font-medium text-[#3f5f4a] hover:underline">
              {application.vacancyTitle}
            </p>
          </Link>
          <Link
            href={employerUrl}
            className="mt-1 inline-flex text-sm text-[#626262] hover:underline"
          >
            {employerName}
          </Link>
        </div>
        <Badge
          variant="outline"
          className={
            archived
              ? "rounded-lg bg-[#f7f7f3] text-[#777]"
              : "rounded-lg bg-white"
          }
        >
          {statusLabel(application.status)}
        </Badge>
      </div>
      <div className="rounded-lg bg-white text-[#626262] flex items-center text-sm">
        <Clock3 className="mr-1 h-3.5 w-3.5" />
        Отклик от {formatDate(application.appliedAt)}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="rounded-lg bg-[#f7f7f3] text-[#4c4c4c]"
        >
          <MapPin />
          {application.city}
        </Badge>
        {badges.map((badge, index) => (
          <Badge
            key={`${badge}-${index}`}
            variant="outline"
            className="rounded-lg bg-[#f7f7f3] text-[#4c4c4c]"
          >
            {badge}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function applicationBadgeLabels(application: CandidateApplicationHistory) {
  return [
    application.direction,
    application.experience?.name,
    application.workFormat?.name,
    application.employment?.name,
  ].filter((value): value is string => Boolean(value));
}
