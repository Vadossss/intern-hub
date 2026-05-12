"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";

import type { VacancyResponseDto } from "@/app/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { statusLabel } from "../utils";
import { AdminHeader } from "./AdminHeader";
import { AdminMutedText } from "./AdminMutedText";

export function ModerationVacanciesSection({
  isLoading,
  isSaving,
  pendingVacancies,
  pendingVacanciesTotal,
  onModerate,
}: {
  isLoading: boolean;
  isSaving: boolean;
  pendingVacancies: VacancyResponseDto[];
  pendingVacanciesTotal: number;
  onModerate: (publicId: string, action: "approve" | "reject") => void;
}) {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Модерация вакансий"
        title="Очередь публикации"
        description="Проверяйте новые вакансии работодателей перед публикацией в публичном поиске."
        action={<Badge variant="outline">{pendingVacanciesTotal} на проверке</Badge>}
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {isLoading ? (
            <AdminMutedText>Загрузка вакансий...</AdminMutedText>
          ) : pendingVacancies.length ? (
            pendingVacancies.map((vacancy) => (
              <div
                key={vacancy.publicId}
                className="rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/vacancies/${vacancy.publicId}`}
                      className="text-base font-extrabold text-[#171717] hover:underline"
                    >
                      {vacancy.title}
                    </Link>
                    <p className="mt-1 text-sm text-[#666]">
                      {vacancy.employer?.companyName ?? "Компания не указана"} ·{" "}
                      {vacancy.city || "Город не указан"} · {statusLabel(vacancy.status)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {vacancy.direction ? (
                        <Badge variant="outline" className="bg-white">
                          {vacancy.direction}
                        </Badge>
                      ) : null}
                      <Badge variant="outline" className="bg-white">
                        {vacancy.publicId}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      className="rounded-xl bg-[#171717] text-white"
                      disabled={isSaving}
                      onClick={() => onModerate(vacancy.publicId, "approve")}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Одобрить
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50"
                      disabled={isSaving}
                      onClick={() => onModerate(vacancy.publicId, "reject")}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отклонить
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <AdminMutedText>Вакансий на модерации нет.</AdminMutedText>
          )}
        </div>
      </div>
    </section>
  );
}
