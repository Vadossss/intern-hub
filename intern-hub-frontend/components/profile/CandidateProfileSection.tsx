import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Mail, Pencil, UserRound } from "lucide-react";

import { SkillsSelector } from "@/components/shared/SkillsSelector";
import { InfoCard } from "@/components/profile/InfoCard";
import { employmentLabels, workFormatLabels } from "@/components/profile/constants";
import { formatMoney, labelFrom, textValue } from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/api/dictionaries";
import type { CandidateProfile } from "@/lib/api/profile";

export function CandidateProfileSection({
  candidate,
  candidateName,
  skillOptions,
  isEditing,
  isSaving,
  onSubmit,
  onEdit,
  onCancel,
}: {
  candidate: CandidateProfile;
  candidateName: string;
  skillOptions: SkillOption[];
  isEditing: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  useEffect(() => {
    if (isEditing) {
      setSelectedSkillIds((candidate.skills ?? []).map((skill) => skill.id));
    }
  }, [candidate.skills, isEditing]);

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#48644d]">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{candidateName}</CardTitle>
                <p className="mt-2 flex flex-wrap gap-3 text-sm text-[#626262]">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </span>
                </p>
              </div>
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
                  name="firstName"
                  defaultValue={candidate.firstName}
                  placeholder="Имя"
                />
                <Input
                  name="lastName"
                  defaultValue={candidate.lastName}
                  placeholder="Фамилия"
                />
                <Input name="city" defaultValue={candidate.city} placeholder="Город" />
                <Input
                  name="preferredCity"
                  defaultValue={candidate.preferredCity}
                  placeholder="Желаемый город"
                />
                <Input
                  name="expectedSalaryFrom"
                  defaultValue={textValue(candidate.expectedSalaryFrom)}
                  placeholder="Зарплата от"
                  type="number"
                />
                <Input
                  name="expectedSalaryTo"
                  defaultValue={textValue(candidate.expectedSalaryTo)}
                  placeholder="Зарплата до"
                  type="number"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  name="preferredWorkFormat"
                  defaultValue={candidate.preferredWorkFormat}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  <option value="remote">Удаленно</option>
                  <option value="office">Офис</option>
                  <option value="hybrid">Гибрид</option>
                  <option value="unknown">Не указано</option>
                </select>
                <select
                  name="preferredEmployment"
                  defaultValue={candidate.preferredEmployment}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  <option value="probation">Стажировка</option>
                  <option value="full">Полная занятость</option>
                  <option value="part">Частичная занятость</option>
                  <option value="project">Проектная работа</option>
                </select>
              </div>
              <textarea
                name="about"
                defaultValue={candidate.about}
                placeholder="О себе"
                className="min-h-28 rounded-md border bg-white px-3 py-2 text-sm"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="resumeUrl"
                  defaultValue={candidate.resumeUrl}
                  placeholder="Ссылка на резюме"
                />
                <Input
                  name="portfolioUrl"
                  defaultValue={candidate.portfolioUrl}
                  placeholder="Ссылка на портфолио"
                />
              </div>
              <SkillsSelector
                skills={skillOptions}
                selectedSkillIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
                name="skillIds"
              />
              <label className="flex items-center gap-3 text-sm text-[#333]">
                <Checkbox
                  name="openToWork"
                  defaultChecked={candidate.openToWork}
                />
                Открыт к предложениям
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isSaving}
                  className="rounded-xl bg-[#171717] text-white"
                >
                  {isSaving ? "Сохранение..." : "Сохранить профиль"}
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
            <div className="space-y-5">
              <p className="text-sm leading-7 text-[#4d4d4d]">{candidate.about}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoCard title="Город" value={candidate.city || "Не указан"} />
                <InfoCard
                  title="Желаемый город"
                  value={candidate.preferredCity || "Не указан"}
                />
                <InfoCard
                  title="Формат"
                  value={labelFrom(workFormatLabels, candidate.preferredWorkFormat)}
                />
                <InfoCard
                  title="Занятость"
                  value={labelFrom(employmentLabels, candidate.preferredEmployment)}
                />
                <InfoCard
                  title="Зарплата"
                  value={formatMoney(
                    candidate.expectedSalaryFrom,
                    candidate.expectedSalaryTo,
                  )}
                />
                <InfoCard
                  title="Статус"
                  value={
                    candidate.openToWork
                      ? "Открыт к предложениям"
                      : "Не ищет работу"
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills ?? []).length > 0 ? (
                  candidate.skills?.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="rounded-lg bg-white"
                    >
                      {skill.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-[#777]">Навыки пока не добавлены</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
