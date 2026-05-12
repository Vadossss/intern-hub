"use client";

import {
  Archive,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Eye,
  FileText,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  Wallet,
} from "lucide-react";

import { formatDate, formatMoney } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CandidateResume } from "@/lib/api/profile";

function badgeItems(resume: CandidateResume) {
  return [
    resume.city ? { icon: MapPin, label: resume.city } : null,
    { icon: Wallet, label: formatMoney(resume.expectedSalaryFrom, resume.expectedSalaryTo) },
    resume.employmentName ? { icon: BriefcaseBusiness, label: resume.employmentName } : null,
    resume.workFormatName ? { icon: BriefcaseBusiness, label: resume.workFormatName } : null,
    resume.experienceName ? { icon: Clock3, label: resume.experienceName } : null,
  ].filter(Boolean) as Array<{
    icon: typeof MapPin;
    label: string;
  }>;
}

export function CandidateResumeCard({
  resume,
  isSaving,
  onArchive,
  onDelete,
  onEdit,
  onPreview,
  onRestore,
  onStats,
}: {
  resume: CandidateResume;
  isSaving: boolean;
  onArchive: (resume: CandidateResume) => void;
  onDelete: (resume: CandidateResume) => void;
  onEdit: (resume: CandidateResume) => void;
  onPreview: (resume: CandidateResume) => void;
  onRestore: (resume: CandidateResume) => void;
  onStats: (resume: CandidateResume) => void;
}) {
  const details = badgeItems(resume);

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h3 className="break-words font-semibold text-[#171717]">
            {resume.profession || "Резюме"}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#777]">
            <Clock3 className="h-4 w-4" />
            Обновлено: {formatDate(resume.updatedAt ?? resume.createdAt)}
          </p>
          {details.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {details.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Badge
                    key={`${item.label}-${index}`}
                    variant="outline"
                    className="rounded-lg bg-[#f7f7f3] text-[#444]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#626262]">Детали не указаны</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
            {resume.archived ? "Архив" : "Активное"}
          </Badge>
          <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
            <Eye className="h-3.5 w-3.5" />
            {resume.viewCount ?? 0}
          </Badge>
        </div>
      </div>

      {resume.skills?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {resume.skills.slice(0, 8).map((skill) => (
            <Badge
              key={skill.id}
              variant="outline"
              className="rounded-lg bg-[#f7f7f3]"
            >
              {skill.name}
            </Badge>
          ))}
          {resume.skills.length > 8 ? (
            <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
              +{resume.skills.length - 8}
            </Badge>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview(resume)}
        >
          <FileText className="h-4 w-4" />
          Предпросмотр
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onStats(resume)}
        >
          <BarChart3 className="h-4 w-4" />
          Статистика
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(resume)}
        >
          <Pencil className="h-4 w-4" />
          Редактировать
        </Button>
        {resume.archived ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => onRestore(resume)}
          >
            <RotateCcw className="h-4 w-4" />
            Вернуть
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => onArchive(resume)}
          >
            <Archive className="h-4 w-4" />
            В архив
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          disabled={isSaving}
          onClick={() => onDelete(resume)}
        >
          <Trash2 className="h-4 w-4" />
          Удалить
        </Button>
      </div>
    </div>
  );
}
