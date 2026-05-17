"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Building2, Camera, Pencil } from "lucide-react";

import {
  RichTextContent,
  RichTextEditor,
} from "@/components/shared/RichText";
import { InfoCard } from "@/components/shared/profile/InfoCard";
import type { EmployerProfile } from "@/components/shared/profile/types";
import { mediaUrl } from "@/components/shared/profile/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { EmployerApplication, EmployerVacancy } from "@/lib/api/profile";

export function EmployerProfileSection({
  employer,
  vacancies,
  applications,
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSubmit,
  onPhotoUpload,
}: {
  employer: EmployerProfile;
  vacancies: EmployerVacancy[];
  applications: EmployerApplication[];
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPhotoUpload: (file: File) => Promise<void>;
}) {
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const avatarSrc = mediaUrl(employer.avatarUrl);

  async function handlePhotoChange(file?: File) {
    if (!file || !isEditing) return;

    try {
      setIsPhotoUploading(true);
      await onPhotoUpload(file);
    } finally {
      setIsPhotoUploading(false);
    }
  }

  const logo = (
    <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#edf3ea] text-[#48644d]">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={employer.companyName || "Компания"}
          className="h-full w-full object-cover"
        />
      ) : (
        <Building2 className="h-9 w-9" />
      )}
      {isEditing ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-100 transition hover:bg-black/55">
          <Camera className="h-6 w-6" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {isEditing ? (
                <label className="cursor-pointer" aria-label="Изменить фото">
                  {logo}
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
                logo
              )}
              <div>
                <CardTitle className="text-2xl">{employer.companyName}</CardTitle>
                <RichTextContent
                  value={employer.about}
                  className="mt-2 text-[#626262]"
                />
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
                  name="companyName"
                  defaultValue={employer.companyName}
                  placeholder="Название компании"
                />
                <Input
                  name="city"
                  defaultValue={employer.city}
                  placeholder="Город"
                />
                <Input
                  name="email"
                  defaultValue={employer.email}
                  placeholder="Email"
                  disabled
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
              <RichTextEditor
                name="about"
                defaultValue={employer.about}
                placeholder="Описание компании"
              />
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
