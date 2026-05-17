"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CandidateResume } from "@/lib/api/profile";

const levelLabels: Record<string, string> = {
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
  NATIVE: "Носитель",
};

export function ResumeExtendedDetails({
  resume,
  className = "",
}: {
  resume: CandidateResume;
  className?: string;
}) {
  const languages = resume.languages ?? [];
  const education = resume.education ?? [];
  const workExperience = resume.workExperience ?? [];

  if (!languages.length && !education.length && !workExperience.length) {
    return null;
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {languages.length ? (
        <section>
          <h4 className="text-sm font-extrabold text-[#171717]">Языки</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {languages.map((item, index) => (
              <Badge
                key={`${item.id ?? "language"}-${index}`}
                variant="outline"
                className="rounded-lg bg-white"
              >
                {item.languageName || "Язык"} · {levelLabels[item.level ?? ""] ?? item.level}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}

      {education.length ? (
        <section>
          <h4 className="text-sm font-extrabold text-[#171717]">Образование</h4>
          <div className="mt-2 grid gap-2">
            {education.map((item, index) => (
              <div
                key={`${item.id ?? "education"}-${index}`}
                className="rounded-xl border border-[#161616]/10 bg-white p-3"
              >
                <p className="font-semibold text-[#171717]">
                  {item.institution}
                </p>
                <p className="mt-1 text-sm text-[#626262]">
                  {[item.specialty, item.educationLevel]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 text-sm text-[#777]">
                  {formatPeriod(
                    item.startDate,
                    item.currentlyStudying ? undefined : item.endDate,
                    item.currentlyStudying ? "Учусь сейчас" : undefined,
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {workExperience.length ? (
        <section>
          <h4 className="text-sm font-extrabold text-[#171717]">Опыт работы</h4>
          <div className="mt-2 grid gap-2">
            {workExperience.map((item, index) => (
              <div
                key={`${item.id ?? "work"}-${index}`}
                className="rounded-xl border border-[#161616]/10 bg-white p-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#171717]">
                      {item.position}
                    </p>
                    <p className="mt-1 text-sm text-[#626262]">
                      {[item.company, item.workFormatName]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 text-sm text-[#777]">
                      {formatPeriod(
                        item.startDate,
                        item.currentlyWorking ? undefined : item.endDate,
                        item.currentlyWorking ? "Работаю сейчас" : undefined,
                      )}
                    </p>
                  </div>
                  {item.projectUrl ? (
                    <Link
                      href={item.projectUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#3f5f4a] hover:underline"
                    >
                      Проект
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function formatPeriod(startDate?: string, endDate?: string, currentLabel?: string) {
  const start = formatDate(startDate);
  const end = currentLabel ?? formatDate(endDate);

  if (!start && !end) {
    return "Период не указан";
  }

  return `${start || "Не указано"} - ${end || "Не указано"}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
