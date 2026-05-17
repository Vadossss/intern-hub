"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Ban,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flag,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ComplaintGroup,
  ComplaintModerationStatus,
  ComplaintReason,
  ComplaintStatus,
  ComplaintTargetType,
} from "@/lib/api/admin";

import { AdminHeader } from "./AdminHeader";
import { AdminMutedText } from "./AdminMutedText";

const targetTypeLabels: Record<ComplaintTargetType, string> = {
  VACANCY: "Вакансия",
  EMPLOYER_PROFILE: "Работодатель",
  CANDIDATE_RESUME: "Резюме",
};

const reasonLabels: Record<ComplaintReason, string> = {
  SPAM: "Спам",
  FRAUD: "Мошенничество",
  MISLEADING_INFORMATION: "Недостоверная информация",
  OFFENSIVE_CONTENT: "Оскорбительный контент",
  DISCRIMINATION: "Дискриминация",
  ILLEGAL_CONTENT: "Запрещённый контент",
  OTHER: "Другое",
};

const statusLabels: Record<ComplaintStatus, string> = {
  NEW: "Новая",
  IN_REVIEW: "В работе",
  RESOLVED: "Решена",
  REJECTED: "Отклонена",
  CANCELED: "Отменена",
};

export function ComplaintsSection({
  complaintGroups,
  isLoading,
  isSaving,
  newComplaintsTotal,
  onBlockOwner,
  onStatusChange,
}: {
  complaintGroups: ComplaintGroup[];
  isLoading: boolean;
  isSaving: boolean;
  newComplaintsTotal: number;
  onBlockOwner: (
    group: ComplaintGroup,
    reason: string,
    moderationComment: string,
  ) => void;
  onStatusChange: (
    group: ComplaintGroup,
    status: ComplaintModerationStatus,
    moderationComment: string,
  ) => void;
}) {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Жалобы"
        title="Очередь обращений"
        description="Жалобы сгруппированы по сущности, чтобы сразу видеть всю историю обращений по конкретной вакансии, работодателю или резюме."
        action={<Badge variant="outline">{newComplaintsTotal} новых</Badge>}
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {isLoading ? (
            <AdminMutedText>Загрузка жалоб...</AdminMutedText>
          ) : complaintGroups.length ? (
            complaintGroups.map((group) => (
              <ComplaintGroupCard
                key={`${group.targetType}:${group.targetId}`}
                group={group}
                isSaving={isSaving}
                onBlockOwner={onBlockOwner}
                onStatusChange={onStatusChange}
              />
            ))
          ) : (
            <AdminMutedText>Жалоб пока нет.</AdminMutedText>
          )}
        </div>
      </div>
    </section>
  );
}

function ComplaintGroupCard({
  group,
  isSaving,
  onBlockOwner,
  onStatusChange,
}: {
  group: ComplaintGroup;
  isSaving: boolean;
  onBlockOwner: (
    group: ComplaintGroup,
    reason: string,
    moderationComment: string,
  ) => void;
  onStatusChange: (
    group: ComplaintGroup,
    status: ComplaintModerationStatus,
    moderationComment: string,
  ) => void;
}) {
  const [moderationComment, setModerationComment] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const canBlockOwner = Boolean(group.ownerId) && !group.ownerBlocked;
  const defaultBlockReason = "Жалобы пользователей подтвердились";

  function handleStatusChange(status: ComplaintModerationStatus) {
    onStatusChange(group, status, moderationComment);
  }

  function handleBlockOwner() {
    onBlockOwner(
      group,
      blockReason.trim() || defaultBlockReason,
      moderationComment,
    );
  }

  return (
    <div className="rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-white">
              {targetTypeLabels[group.targetType]}
            </Badge>
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-700"
            >
              <Flag className="h-3.5 w-3.5" />
              {group.totalCount} жалоб
            </Badge>
            {group.newCount > 0 ? (
              <Badge className="bg-[#171717] text-white hover:bg-[#171717]">
                {group.newCount} новых
              </Badge>
            ) : null}
            {group.ownerBlocked ? (
              <Badge
                variant="outline"
                className="border-[#161616]/20 bg-white text-[#171717]"
              >
                Владелец заблокирован
              </Badge>
            ) : null}
          </div>

          <h3 className="mt-3 break-words text-lg font-extrabold text-[#171717]">
            {group.targetTitle}
          </h3>
          <p className="mt-1 text-sm text-[#666]">
            {group.targetSubtitle || "Детали сущности не указаны"} · ID:{" "}
            {group.targetId}
          </p>
          {group.ownerName ? (
            <p className="mt-1 text-xs font-semibold text-[#777]">
              Владелец: {group.ownerName}
              {group.ownerId ? ` · #${group.ownerId}` : ""}
              {group.ownerStatus ? ` · ${group.ownerStatus}` : ""}
            </p>
          ) : null}
        </div>

        {group.targetHref ? (
          <Button asChild variant="outline" className="shrink-0 rounded-xl bg-white">
            <Link href={group.targetHref}>
              Открыть
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {group.reasonCounts.map((item) => (
          <Badge key={item.reason} variant="outline" className="bg-white">
            {reasonLabels[item.reason]}: {item.count}
          </Badge>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
        <textarea
          className="min-h-24 rounded-xl border border-[#161616]/10 bg-white px-3 py-2 text-sm text-[#171717] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#171717]/40"
          placeholder="Комментарий модератора к реакции на жалобы"
          value={moderationComment}
          onChange={(event) => setModerationComment(event.target.value)}
        />

        <div className="space-y-2">
          <Input
            className="rounded-xl bg-white"
            placeholder="Причина блокировки"
            value={blockReason}
            onChange={(event) => setBlockReason(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl bg-white"
              disabled={isSaving}
              onClick={() => handleStatusChange("IN_REVIEW")}
            >
              <Clock3 className="h-4 w-4" />
              В работу
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl bg-white"
              disabled={isSaving}
              onClick={() => handleStatusChange("CANCELED")}
            >
              <XCircle className="h-4 w-4" />
              Отменить
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl bg-white"
              disabled={isSaving}
              onClick={() => handleStatusChange("RESOLVED")}
            >
              <CheckCircle2 className="h-4 w-4" />
              Решено
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-[#171717] text-white hover:bg-[#171717]/90"
              disabled={isSaving || !canBlockOwner}
              onClick={handleBlockOwner}
            >
              <Ban className="h-4 w-4" />
              Блок
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {group.complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="rounded-xl border border-[#161616]/10 bg-white p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{reasonLabels[complaint.reason]}</Badge>
                <Badge variant="outline" className={statusClassName(complaint.status)}>
                  {statusLabels[complaint.status]}
                </Badge>
              </div>
              <span className="text-xs font-semibold text-[#777]">
                {formatDateTime(complaint.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-[#555]">
              {complaint.description || "Пользователь не добавил описание."}
            </p>

            {complaint.moderationComment ? (
              <p className="mt-2 rounded-lg bg-[#f8f7f2] px-3 py-2 text-sm leading-6 text-[#555]">
                <span className="font-semibold text-[#171717]">
                  Комментарий модератора:
                </span>{" "}
                {complaint.moderationComment}
              </p>
            ) : null}

            <p className="mt-2 text-xs font-semibold text-[#777]">
              Жалоба #{complaint.id}
              {complaint.reporterEmail ? ` · ${complaint.reporterEmail}` : ""}
              {complaint.reporterId ? ` · пользователь #${complaint.reporterId}` : ""}
              {complaint.moderatorEmail
                ? ` · модератор ${complaint.moderatorEmail}`
                : ""}
              {complaint.moderatedAt
                ? ` · реакция ${formatDateTime(complaint.moderatedAt)}`
                : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusClassName(status: ComplaintStatus) {
  if (status === "NEW") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "IN_REVIEW") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "RESOLVED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "CANCELED") {
    return "border-[#161616]/15 bg-[#f8f7f2] text-[#555]";
  }

  return "border-[#161616]/15 bg-white text-[#555]";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Дата не указана";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
