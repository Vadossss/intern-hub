import Link from "next/link";
import { ArrowUpRight, Pencil, Plus } from "lucide-react";

import { statusLabel, vacancyHref } from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployerVacancy } from "@/lib/api/profile";

export function EmployerVacanciesSection({
  vacancies,
  onOpenApplications,
}: {
  vacancies: EmployerVacancy[];
  onOpenApplications: (publicId: string) => void;
}) {
  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Вакансии</CardTitle>
          <Button asChild className="w-fit rounded-xl bg-[#171717] text-white">
            <Link href="/create">
              <Plus className="h-4 w-4" />
              Создать вакансию
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vacancies.map((vacancy) => (
          <div
            key={vacancy.publicId}
            className="rounded-2xl border bg-white p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="font-semibold text-[#171717]">{vacancy.title}</p>
                <p className="mt-1 text-sm text-[#626262]">
                  {[vacancy.stack, vacancy.city].filter(Boolean).join(" • ") ||
                    "Детали не указаны"}
                </p>
              </div>
              <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                {statusLabel(vacancy.status)}
              </Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenApplications(vacancy.publicId)}
              >
                Отклики
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={vacancyHref(vacancy.publicId)}>
                  <ArrowUpRight className="h-4 w-4" />
                  Открыть
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/create?vacancy=${vacancy.publicId}`}>
                  <Pencil className="h-4 w-4" />
                  Редактировать
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
