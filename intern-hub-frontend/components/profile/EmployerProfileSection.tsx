import type { FormEvent } from "react";
import { Pencil } from "lucide-react";

import { InfoCard } from "@/components/profile/InfoCard";
import type { EmployerProfile } from "@/components/profile/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EmployerApplication, EmployerVacancy } from "@/lib/api/profile";

export function EmployerProfileSection({
  employer,
  vacancies,
  applications,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
}: {
  employer: EmployerProfile;
  vacancies: EmployerVacancy[];
  applications: EmployerApplication[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">{employer.companyName}</CardTitle>
              <p className="mt-2 text-sm text-[#626262]">{employer.about}</p>
            </div>
            {!isEditing ? (
              <Button variant="outline" className="rounded-xl" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
                Редактировать
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={onSubmit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="companyName"
                  defaultValue={employer.companyName}
                  placeholder="Название компании"
                />
                <Input name="city" defaultValue={employer.city} placeholder="Город" />
                <Input
                  name="email"
                  defaultValue={employer.email}
                  placeholder="Email"
                />
                <Input
                  name="phone"
                  defaultValue={employer.phone}
                  placeholder="Телефон"
                />
                <Input
                  name="website"
                  defaultValue={employer.website}
                  placeholder="Сайт"
                />
                <Input
                  name="contactName"
                  defaultValue={employer.contactName}
                  placeholder="Контактное лицо"
                />
              </div>
              <textarea
                name="about"
                defaultValue={employer.about}
                placeholder="Описание компании"
                className="min-h-28 rounded-md border bg-white px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-xl bg-[#171717] text-white">
                  Сохранить профиль
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={onCancel}
                >
                  Отмена
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Город" value={employer.city || "Не указан"} />
              <InfoCard title="Email" value={employer.email || "Не указан"} />
              <InfoCard title="Телефон" value={employer.phone || "Не указан"} />
              <InfoCard
                title="Контакт"
                value={employer.contactName || "Не указан"}
              />
              <InfoCard title="Сайт" value={employer.website || "Не указан"} />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <InfoCard title="Вакансии" value={`${vacancies.length} всего`} />
        <InfoCard
          title="Активные"
          value={`${vacancies.filter((item) => item.status !== "ARCHIVED").length} вакансий`}
        />
        <InfoCard title="Отклики" value={`${applications.length} всего`} />
      </div>
    </div>
  );
}
