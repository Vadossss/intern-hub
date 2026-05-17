"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Building2, CheckCircle2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminEmployerCreatePayload,
  AdminEmployerOption,
} from "@/lib/api/admin";

import { AdminHeader } from "./AdminHeader";
import { AdminPanel } from "./AdminPanel";

const emptyForm = {
  email: "",
  password: "",
  companyName: "",
  city: "",
  website: "",
  about: "",
  verified: true,
  accredited: false,
};

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

type EmployerForm = typeof emptyForm;

export function AdminEmployerCreateSection({
  isSaving,
  onCreate,
}: {
  isSaving: boolean;
  onCreate: (
    payload: AdminEmployerCreatePayload,
  ) => Promise<AdminEmployerOption | null>;
}) {
  const [form, setForm] = useState<EmployerForm>(emptyForm);
  const [createdEmployer, setCreatedEmployer] =
    useState<AdminEmployerOption | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatedEmployer(null);

    const payload: AdminEmployerCreatePayload = {
      email: form.email.trim() || undefined,
      password: form.password.trim() || undefined,
      companyName: form.companyName.trim(),
      city: form.city.trim() || undefined,
      website: form.website.trim() || undefined,
      about: form.about.trim() || undefined,
      verified: form.verified,
      accredited: form.accredited,
      avatar: avatarFile ?? undefined,
    };

    const created = await onCreate(payload);

    if (created) {
      setCreatedEmployer(created);
      setForm(emptyForm);
      clearAvatar();
    }
  }

  function clearAvatar() {
    setAvatarFile(null);
    setAvatarError("");
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  function handleAvatarChange(file?: File) {
    if (!file) {
      clearAvatar();
      return;
    }

    if (!file.type.startsWith("image/")) {
      clearAvatar();
      setAvatarError("Можно загрузить только изображение.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      clearAvatar();
      setAvatarError("Файл слишком большой. Максимальный размер: 10 МБ.");
      return;
    }

    setAvatarError("");
    setAvatarFile(file);
  }

  function updateForm<K extends keyof EmployerForm>(
    field: K,
    value: EmployerForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Работодатели"
        title="Создать работодателя"
        description="Добавьте карточку работодателя вручную: укажите основные данные компании и отметьте, прошла ли она проверку и аккредитацию."
      />

      <AdminPanel title="Данные компании">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[#626262] ring-1 ring-[#161616]/10">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Аватар компании"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-9 w-9" />
              )}
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#161616]/15 bg-white px-4 py-2 text-sm font-bold text-[#171717] transition hover:border-[#171717]/40">
                <Upload className="h-4 w-4" />
                Загрузить аватар
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isSaving}
                  onChange={(event) =>
                    handleAvatarChange(event.target.files?.[0])
                  }
                />
              </label>
              {avatarFile ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#161616]/15 bg-white px-4 py-2 text-sm font-bold text-[#626262] transition hover:border-[#171717]/40 hover:text-[#171717]"
                  onClick={clearAvatar}
                >
                  <X className="h-4 w-4" />
                  Убрать
                </button>
              ) : null}
              {avatarFile ? (
                <span className="min-w-0 truncate text-sm text-[#626262]">
                  {avatarFile.name}
                </span>
              ) : null}
              <span className="basis-full text-xs font-semibold text-[#626262]">
                PNG, JPG или WebP до 10 МБ
              </span>
              {avatarError ? (
                <span className="basis-full text-sm font-bold text-red-600">
                  {avatarError}
                </span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#171717]">
              Название компании
              <Input
                value={form.companyName}
                placeholder="InternHub"
                className="rounded-xl border-[#161616]/15"
                required
                onChange={(event) =>
                  updateForm("companyName", event.target.value)
                }
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#171717]">
              Почта
              <Input
                type="email"
                value={form.email}
                placeholder="company@example.com"
                className="rounded-xl border-[#161616]/15"
                onChange={(event) => updateForm("email", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#171717]">
              Пароль
              <Input
                type="password"
                value={form.password}
                placeholder="Можно оставить пустым"
                className="rounded-xl border-[#161616]/15"
                onChange={(event) =>
                  updateForm("password", event.target.value)
                }
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#171717]">
              Город
              <Input
                value={form.city}
                placeholder="Москва"
                className="rounded-xl border-[#161616]/15"
                onChange={(event) => updateForm("city", event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-[#171717]">
              Сайт
              <Input
                type="url"
                value={form.website}
                placeholder="https://company.ru"
                className="rounded-xl border-[#161616]/15"
                onChange={(event) => updateForm("website", event.target.value)}
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#171717]">
            Описание компании
            <textarea
              value={form.about}
              placeholder="Коротко о компании, команде и стажировках"
              className="min-h-32 rounded-xl border border-[#161616]/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#171717]"
              onChange={(event) => updateForm("about", event.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] px-4 py-3 text-sm font-semibold text-[#171717]">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(event) =>
                  updateForm("verified", event.target.checked)
                }
              />
              Проверенный работодатель
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] px-4 py-3 text-sm font-semibold text-[#171717]">
              <input
                type="checkbox"
                checked={form.accredited}
                onChange={(event) =>
                  updateForm("accredited", event.target.checked)
                }
              />
              Аккредитован
            </label>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl bg-[#171717] text-white sm:w-auto"
            disabled={isSaving}
          >
            Создать работодателя
          </Button>
        </form>
      </AdminPanel>

      {createdEmployer ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-extrabold">
            {createdEmployer.companyName || createdEmployer.email}
          </span>
          <span>создан</span>
          <span className="rounded-full bg-white px-2 py-1 text-xs font-bold">
            ID {createdEmployer.id}
          </span>
        </div>
      ) : null}
    </section>
  );
}
