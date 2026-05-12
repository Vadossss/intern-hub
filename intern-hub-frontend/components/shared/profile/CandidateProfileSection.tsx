"use client";

import { ru } from "react-day-picker/locale";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Camera, Mail, Pencil, UserRound } from "lucide-react";

import { InfoCard } from "@/components/shared/profile/InfoCard";
import {
  formatBirthday,
  mediaUrl,
  textValue,
} from "@/components/shared/profile/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { CandidateProfile } from "@/lib/api/profile";

export function CandidateProfileSection({
  candidate,
  isEditing,
  isSaving,
  onSubmit,
  onPhotoUpload,
  onEdit,
  onCancel,
}: {
  candidate: CandidateProfile;
  isEditing: boolean;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPhotoUpload: (file: File) => Promise<void>;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const [selectedBirthday, setSelectedBirthday] = useState<Date | undefined>();
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const avatarSrc = mediaUrl(candidate.avatarUrl);
  const fullName = [candidate.firstName, candidate.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const displayName = fullName || "Имя не указано";

  useEffect(() => {
    if (isEditing) {
      setSelectedBirthday(parseBirthday(candidate.birthday));
    }
  }, [candidate.birthday, isEditing]);

  async function handlePhotoChange(file?: File) {
    if (!file || !isEditing) return;

    try {
      setIsPhotoUploading(true);
      await onPhotoUpload(file);
    } finally {
      setIsPhotoUploading(false);
    }
  }

  const avatar = (
    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-[#edf3ea] text-[#48644d]">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={candidate.email}
          className="h-full w-full object-cover"
        />
      ) : (
        <UserRound className="h-9 w-9" />
      )}
      {isEditing ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-100 transition hover:bg-black/55">
          <Camera className="h-6 w-6" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {isEditing ? (
                <label className="cursor-pointer" aria-label="Изменить фото">
                  {avatar}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={isPhotoUploading}
                    onChange={(event) => {
                      void handlePhotoChange(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              ) : (
                avatar
              )}
              <div>
                <CardTitle className="text-2xl">Личные данные</CardTitle>
                <p className="mt-1 text-lg font-extrabold text-[#171717]">
                  {displayName}
                </p>
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
              <input
                type="hidden"
                name="birthday"
                value={dateInputValue(selectedBirthday)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#333]">
                    Имя
                  </span>
                  <Input
                    name="firstName"
                    defaultValue={candidate.firstName}
                    placeholder="Иван"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#333]">
                    Фамилия
                  </span>
                  <Input
                    name="lastName"
                    defaultValue={candidate.lastName}
                    placeholder="Иванов"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#333]">
                    Почта
                  </span>
                  <Input value={candidate.email} readOnly className="bg-[#f7f7f3]" />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[#333]">
                    Номер телефона
                  </span>
                  <Input
                    name="phoneNumber"
                    defaultValue={candidate.phoneNumber}
                    placeholder="+7 999 000-00-00"
                    type="tel"
                  />
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-xl border border-[#161616]/10 bg-white p-3 text-sm font-semibold text-[#333]">
                <Checkbox
                  name="openToWork"
                  defaultChecked={candidate.openToWork !== false}
                />
                Открыт к предложениям
              </label>
              <div className="rounded-2xl border bg-white p-3">
                <p className="mb-2 text-sm font-semibold text-[#333]">
                  День рождения
                </p>
                <Calendar
                  mode="single"
                  selected={selectedBirthday}
                  onSelect={setSelectedBirthday}
                  captionLayout="dropdown"
                  startMonth={new Date(1950, 0)}
                  locale={ru}
                  endMonth={
                    new Date(
                      new Date().setFullYear(new Date().getFullYear() - 10),
                    )
                  }
                  disabled={{ after: new Date() }}
                  className="rounded-xl border"
                />
              </div>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard
                title="Имя"
                value={textValue(candidate.firstName) || "Не указано"}
              />
              <InfoCard
                title="Фамилия"
                value={textValue(candidate.lastName) || "Не указана"}
              />
              <InfoCard title="Почта" value={candidate.email || "Не указана"} />
              <InfoCard
                title="Номер телефона"
                value={textValue(candidate.phoneNumber) || "Не указан"}
              />
              <InfoCard
                title="День рождения"
                value={formatBirthday(candidate.birthday)}
              />
              <InfoCard
                title="Статус поиска"
                value={
                  candidate.openToWork === false
                    ? "Не ищет работу"
                    : "Открыт к предложениям"
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function parseBirthday(value?: string) {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00`);
}

function dateInputValue(date?: Date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
