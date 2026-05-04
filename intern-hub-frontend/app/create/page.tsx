"use client";

import { Suspense, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  BriefcaseBusiness,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkillsSelector } from "@/components/shared/SkillsSelector";
import {
  archiveVacancy,
  createVacancy,
  deleteVacancy,
  EmployerVacancy,
  getVacancy,
  updateEmployerVacancy,
  VacancyPayload,
} from "@/lib/api/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DictionaryItem,
  getVacancyDictionaries,
  VacancyDictionaries,
} from "@/lib/api/dictionaries";

const emptyDictionaries: VacancyDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  stacks: [],
  skills: [],
};

function textValue(value: FormDataEntryValue | null) {
  return value === null ? "" : String(value);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function skillIds(value: FormDataEntryValue | FormDataEntryValue[] | null) {
  const values = Array.isArray(value) ? value : [value];

  return values
    .flatMap((item) => textValue(item).split(","))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function optionValue(
  options: DictionaryItem[],
  value?: { id?: string; name?: string } | string,
  fallback = "",
) {
  const rawValue =
    typeof value === "string" ? value : (value?.id ?? value?.name);
  const matched = options.find(
    (option) => option.id === rawValue || option.name === rawValue,
  );

  return matched?.id ?? rawValue ?? options[0]?.id ?? fallback;
}

function buildPayload(formData: FormData): VacancyPayload {
  const contactValue = textValue(formData.get("contactValue"));

  return {
    title: textValue(formData.get("title")),
    stack: textValue(formData.get("stack")),
    description: textValue(formData.get("description")),
    city: textValue(formData.get("city")),
    link: textValue(formData.get("link")),
    employment: textValue(formData.get("employment")),
    experience: textValue(formData.get("experience")),
    workFormat: textValue(formData.get("workFormat")),
    skills: skillIds(formData.getAll("skills")),
    salary: {
      from: optionalNumber(formData.get("salaryFrom")),
      to: optionalNumber(formData.get("salaryTo")),
      currency: textValue(formData.get("currency")) || "RUR",
    },
    contactsList: contactValue
      ? [
          {
            chosenContactMethod:
              textValue(formData.get("contactMethod")) || "EMAIL",
            contactValue,
            hint: textValue(formData.get("contactHint")),
          },
        ]
      : [],
  };
}

function VacancyFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vacancyId = searchParams.get("vacancy");
  const isEditMode = Boolean(vacancyId);
  const [vacancy, setVacancy] = useState<EmployerVacancy | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(vacancyId));
  const [isDictionaryLoading, setIsDictionaryLoading] = useState(true);
  const [dictionaries, setDictionaries] =
    useState<VacancyDictionaries>(emptyDictionaries);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDictionaries() {
      try {
        setIsDictionaryLoading(true);
        const response = await getVacancyDictionaries();
        if (isMounted) setDictionaries(response);
      } catch (error) {
        console.error("Failed to load vacancy dictionaries:", error);
        if (isMounted) {
          setMessage(
            "Не удалось загрузить справочники для вакансии. Проверьте доступность бэкенда.",
          );
        }
      } finally {
        if (isMounted) setIsDictionaryLoading(false);
      }
    }

    loadDictionaries();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadVacancy() {
      if (!vacancyId) return;

      try {
        setIsLoading(true);
        const response = await getVacancy(vacancyId);
        if (isMounted) {
          setVacancy(response);
          setSelectedSkillIds((response.skills ?? []).map((skill) => skill.id));
        }
      } catch (error) {
        console.error("Failed to load vacancy:", error);
        if (isMounted)
          setMessage("Не удалось загрузить вакансию для редактирования.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadVacancy();

    return () => {
      isMounted = false;
    };
  }, [vacancyId]);

  const isArchived = vacancy?.status === "ARCHIVED";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildPayload(new FormData(event.currentTarget));
    payload.skills = selectedSkillIds;

    if (!payload.title.trim()) {
      setMessage("Название вакансии обязательно.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      if (isEditMode && vacancyId) {
        await updateEmployerVacancy(vacancyId, payload);
        setMessage("Вакансия обновлена.");
      } else {
        await createVacancy(payload);
        setMessage("Вакансия создана.");
      }

      router.push("/profile");
    } catch (error) {
      console.error("Failed to save vacancy:", error);
      setMessage(
        "Не удалось сохранить вакансию. Проверьте сервер и права работодателя.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchiveVacancy() {
    if (!vacancyId) return;

    try {
      setIsArchiving(true);
      await archiveVacancy(vacancyId);
      setVacancy((currentVacancy) =>
        currentVacancy
          ? { ...currentVacancy, status: "ARCHIVED" }
          : currentVacancy,
      );
      setMessage("Вакансия архивирована.");
      toast.success("Вакансия архивирована.");
    } catch (error) {
      console.error("Failed to archive vacancy:", error);
      setMessage("Не удалось архивировать вакансию.");
      toast.error("Не удалось архивировать вакансию.");
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleDeleteVacancy() {
    if (!vacancyId) return;

    try {
      setIsDeleting(true);
      await deleteVacancy(vacancyId);
      toast.success("Вакансия удалена.");
      router.push("/profile?section=vacancies");
    } catch (error) {
      console.error("Failed to delete vacancy:", error);
      setMessage("Не удалось удалить вакансию.");
      toast.error("Не удалось удалить вакансию.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  }

  const contact = vacancy?.contacts?.[0];

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <section className="border-b border-[#161616]/10 bg-[#161616] text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <Button
            asChild
            variant="outline"
            className="mb-4 rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4" />
              Назад в профиль
            </Link>
          </Button>
          <div className="flex items-start gap-2">
            <div>
              <h1 className="text-3xl font-black uppercase leading-tight sm:text-4xl">
                {isEditMode ? "Редактирование вакансии" : "Создание вакансии"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                Заполните основные условия, стек, описание и контакт для
                кандидатов.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {message ? (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        ) : null}

        <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">
                  {isLoading ? "Загрузка..." : "Данные вакансии"}
                </CardTitle>
                {isEditMode && vacancy ? (
                  <p className="mt-2 text-sm text-[#626262]">
                    Статус:{" "}
                    {isArchived ? "в архиве" : (vacancy.status ?? "активна")}
                  </p>
                ) : null}
              </div>
              {isEditMode ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={isLoading || isArchiving || isArchived}
                    onClick={handleArchiveVacancy}
                  >
                    <Archive className="h-4 w-4" />
                    {isArchived
                      ? "В архиве"
                      : isArchiving
                        ? "Архивация..."
                        : "Архивировать"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                    disabled={isLoading || isDeleting}
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <form
              key={`${vacancy?.publicId ?? "new-vacancy"}-${isDictionaryLoading ? "loading" : "ready"}`}
              onSubmit={handleSubmit}
              className="grid gap-5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="title"
                  defaultValue={vacancy?.title}
                  placeholder="Название вакансии"
                  required
                />
                <select
                  name="stack"
                  defaultValue={optionValue(
                    dictionaries.stacks,
                    vacancy?.stack,
                  )}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  required
                >
                  <option value="" disabled>
                    Направление
                  </option>
                  {dictionaries.stacks.map((stack) => (
                    <option key={stack.id} value={stack.id}>
                      {stack.name}
                    </option>
                  ))}
                </select>
                <Input
                  name="city"
                  defaultValue={vacancy?.city}
                  placeholder="Город"
                />
                <Input name="link" placeholder="Внешняя ссылка" />
              </div>

              <textarea
                name="description"
                defaultValue={vacancy?.description}
                placeholder="Описание задач, команды и ожиданий"
                className="min-h-40 rounded-md border bg-white px-3 py-2 text-sm"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  name="salaryFrom"
                  defaultValue={vacancy?.salaryFrom}
                  placeholder="Зарплата от"
                  type="number"
                />
                <Input
                  name="salaryTo"
                  defaultValue={vacancy?.salaryTo}
                  placeholder="Зарплата до"
                  type="number"
                />
                <select
                  name="currency"
                  defaultValue={optionValue(
                    dictionaries.currencies,
                    vacancy?.currency,
                    "RUR",
                  )}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  {dictionaries.currencies.map((currency) => (
                    <option key={currency.id} value={currency.id}>
                      {currency.abbr
                        ? `${currency.name} (${currency.abbr})`
                        : currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <select
                  name="employment"
                  defaultValue={optionValue(
                    dictionaries.employments,
                    vacancy?.employment,
                    "probation",
                  )}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  {dictionaries.employments.map((employment) => (
                    <option key={employment.id} value={employment.id}>
                      {employment.name}
                    </option>
                  ))}
                </select>
                <select
                  name="experience"
                  defaultValue={optionValue(
                    dictionaries.experiences,
                    vacancy?.experience,
                    "noExperience",
                  )}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  {dictionaries.experiences.map((experience) => (
                    <option key={experience.id} value={experience.id}>
                      {experience.name}
                    </option>
                  ))}
                </select>
                <select
                  name="workFormat"
                  defaultValue={optionValue(
                    dictionaries.workFormats,
                    vacancy?.workFormat,
                    "hybrid",
                  )}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  {dictionaries.workFormats.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>
              </div>

              <SkillsSelector
                skills={dictionaries.skills}
                selectedSkillIds={selectedSkillIds}
                onChange={setSelectedSkillIds}
                name="skills"
              />

              <div className="grid gap-4 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4 sm:grid-cols-3">
                <select
                  name="contactMethod"
                  defaultValue={contact?.chosenContactMethod ?? "EMAIL"}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                >
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Телефон</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="EXTERNAL_LINK">Внешняя ссылка</option>
                  <option value="INTERNAL_CHAT">Чат</option>
                </select>
                <Input
                  name="contactValue"
                  defaultValue={contact?.contactValue}
                  placeholder="Контакт"
                />
                <Input
                  name="contactHint"
                  defaultValue={contact?.hint}
                  placeholder="Подсказка"
                />
              </div>

              <Button
                disabled={isSaving || isLoading || isDictionaryLoading}
                className="w-fit rounded-xl bg-[#171717] text-white"
              >
                <Save className="h-4 w-4" />
                {isSaving
                  ? "Сохранение..."
                  : isDictionaryLoading
                    ? "Загрузка справочников..."
                    : isEditMode
                      ? "Сохранить изменения"
                      : "Создать вакансию"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить вакансию?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[#555]">
              Вакансия “{vacancy?.title ?? "без названия"}” будет удалена без
              возможности восстановления. Это действие нельзя отменить.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Отмена
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-red-700 text-white hover:bg-red-800"
                onClick={handleDeleteVacancy}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Удаление..." : "Да, удалить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Загрузка...</div>}>
      <VacancyFormPage />
    </Suspense>
  );
}
