"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin, MessageCircle } from "lucide-react";

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

type ApplicationsView = "active" | "accepted" | "rejected";

const applicationTabs: Array<{
  id: ApplicationsView;
  label: string;
  empty: string;
}> = [
  {
    id: "active",
    label: "Активные",
    empty: "Активных откликов пока нет.",
  },
  {
    id: "accepted",
    label: "Приняты",
    empty: "Принятых откликов пока нет.",
  },
  {
    id: "rejected",
    label: "Отказано",
    empty: "Отказов пока нет.",
  },
];

export function CandidateApplicationsSection({
  applications,
}: {
  applications: CandidateApplicationHistory[];
}) {
  const [view, setView] = useState<ApplicationsView>("active");
  const applicationGroups: Record<
    ApplicationsView,
    CandidateApplicationHistory[]
  > = {
    active: applications.filter(isActiveApplication),
    accepted: applications.filter(isAcceptedApplication),
    rejected: applications.filter(isRejectedApplication),
  };
  const visibleApplications = applicationGroups[view];
  const activeTab = applicationTabs.find((tab) => tab.id === view);

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
              groups={applicationGroups}
              onChange={setView}
            />
            <ApplicationGroup
              title={activeTab?.label ?? "Отклики"}
              applications={visibleApplications}
              empty={activeTab?.empty ?? "Откликов пока нет."}
              resolved={view !== "active"}
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
  groups,
  onChange,
}: {
  view: ApplicationsView;
  groups: Record<ApplicationsView, CandidateApplicationHistory[]>;
  onChange: (view: ApplicationsView) => void;
}) {
  return (
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
          onClick={() => onChange(tab.id)}
        >
          <span className="block text-sm font-extrabold">{tab.label}</span>
          <span
            className={`mt-1 block text-xs ${
              view === tab.id ? "text-white/65" : "text-[#777]"
            }`}
          >
            {groups[tab.id].length} откликов
          </span>
        </button>
      ))}
    </div>
  );
}

function ApplicationGroup({
  title,
  applications,
  empty,
  resolved = false,
}: {
  title: string;
  applications: CandidateApplicationHistory[];
  empty: string;
  resolved?: boolean;
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
            resolved={resolved}
          />
        ))
      ) : (
        <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
          {empty}
        </p>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  resolved,
}: {
  application: CandidateApplicationHistory;
  resolved: boolean;
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
            resolved
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
        {application.chatId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("intern-hub:open-chat", {
                  detail: { chatId: application.chatId },
                }),
              )
            }
          >
            <MessageCircle className="h-4 w-4" />
            Открыть чат
          </Button>
        ) : null}
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

function isAcceptedApplication(application: CandidateApplicationHistory) {
  return application.status === "ACCEPTED";
}

function isRejectedApplication(application: CandidateApplicationHistory) {
  return (
    application.status === "REJECTED" ||
    (Boolean(application.archived) && application.status !== "ACCEPTED")
  );
}

function isActiveApplication(application: CandidateApplicationHistory) {
  return (
    !isAcceptedApplication(application) && !isRejectedApplication(application)
  );
}
