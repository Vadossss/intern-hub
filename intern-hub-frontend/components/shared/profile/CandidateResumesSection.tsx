"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Archive,
  BriefcaseBusiness,
  Clock3,
  FilePlus2,
  MapPin,
  Pencil,
  RotateCcw,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { RichTextContent, RichTextEditor } from "@/components/shared/RichText";
import { SkillsSelector } from "@/components/shared/SkillsSelector";
import {
  DictionarySelect,
  FieldError,
  ResumeConfirmDialog,
  ResumeMeta,
} from "@/components/shared/profile/CandidateResumesSectionParts";
import type {
  ResumeConfirmAction,
  ResumeFieldName,
  ResumeFormErrors,
  ResumeMode,
} from "@/components/shared/profile/CandidateResumesSection.types";
import {
  fieldControlClass,
  fieldPanelClass,
  getDefaultResumeId,
  hasFormErrors,
  validateResumePayload,
} from "@/components/shared/profile/CandidateResumesSection.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { VacancyDictionaries } from "@/lib/api/dictionaries";
import type { CandidateResume, CandidateResumePayload } from "@/lib/api/profile";
import { formatDate, formatMoney, numberValue, textValue } from "@/components/shared/profile/utils";

export function CandidateResumesSection({
  resumes,
  dictionaries,
  isSaving,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
  onDelete,
}: {
  resumes: CandidateResume[];
  dictionaries: VacancyDictionaries | null;
  isSaving: boolean;
  onCreate: (payload: CandidateResumePayload) => Promise<CandidateResume>;
  onUpdate: (
    resumeId: number,
    payload: CandidateResumePayload,
  ) => Promise<CandidateResume>;
  onArchive: (resumeId: number) => Promise<CandidateResume>;
  onRestore: (resumeId: number) => Promise<CandidateResume>;
  onDelete: (resumeId: number) => Promise<void>;
}) {
  const [activeResumeId, setActiveResumeId] = useState<number | null>(
    getDefaultResumeId(resumes),
  );
  const [mode, setMode] = useState<ResumeMode>("view");
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<ResumeFormErrors>({});
  const [confirmAction, setConfirmAction] =
    useState<ResumeConfirmAction | null>(null);
  const [pendingResume, setPendingResume] = useState<CandidateResume | null>(
    null,
  );

  const activeResume = useMemo(
    () => resumes.find((resume) => resume.id === activeResumeId) ?? resumes[0],
    [activeResumeId, resumes],
  );

  useEffect(() => {
    if (resumes.length === 0) {
      setActiveResumeId(null);
      return;
    }

    if (!activeResumeId || !resumes.some((resume) => resume.id === activeResumeId)) {
      setActiveResumeId(getDefaultResumeId(resumes));
    }
  }, [activeResumeId, resumes]);

  function startCreate() {
    setMode("create");
    setSelectedSkillIds([]);
    setFormErrors({});
  }

  function startEdit(resume: CandidateResume) {
    setActiveResumeId(resume.id);
    setMode("edit");
    setSelectedSkillIds((resume.skills ?? []).map((skill) => skill.id));
    setFormErrors({});
  }

  function clearFieldError(field: ResumeFieldName) {
    setFormErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const { [field]: _removed, ...nextErrors } = currentErrors;
      return nextErrors;
    });
  }

  function handleSkillChange(ids: number[]) {
    setSelectedSkillIds(ids);

    if (ids.length > 0) {
      clearFieldError("skillIds");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload: CandidateResumePayload = {
      profession: textValue(formData.get("profession")),
      city: textValue(formData.get("city")),
      expectedSalaryFrom: numberValue(formData.get("expectedSalaryFrom")),
      expectedSalaryTo: numberValue(formData.get("expectedSalaryTo")),
      employmentId: textValue(formData.get("employmentId")),
      workFormatId: textValue(formData.get("workFormatId")),
      experienceId: textValue(formData.get("experienceId")),
      about: textValue(formData.get("about")),
      skillIds: selectedSkillIds,
    };

    const nextErrors = validateResumePayload(payload);

    if (hasFormErrors(nextErrors)) {
      setFormErrors(nextErrors);
      toast.error("Заполните обязательные поля резюме.");
      return;
    }

    setFormErrors({});

    try {
      const saved =
        mode === "create"
          ? await onCreate(payload)
          : activeResume
            ? await onUpdate(activeResume.id, payload)
            : null;

      if (saved) {
        setActiveResumeId(saved.id);
        setMode("view");
      }
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  function openConfirm(action: ResumeConfirmAction, resume: CandidateResume) {
    setConfirmAction(action);
    setPendingResume(resume);
  }

  function closeConfirm() {
    if (isSaving) return;

    setConfirmAction(null);
    setPendingResume(null);
  }

  async function handleArchive(resume: CandidateResume) {
    try {
      const updated = await onArchive(resume.id);
      setActiveResumeId(updated.id);
      closeConfirm();
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  async function handleRestore(resume: CandidateResume) {
    try {
      const updated = await onRestore(resume.id);
      setActiveResumeId(updated.id);
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  async function handleDelete(resume: CandidateResume) {
    try {
      await onDelete(resume.id);
      const nextResume = resumes.find((item) => item.id !== resume.id);
      setActiveResumeId(nextResume?.id ?? null);
      setMode("view");
      closeConfirm();
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  async function handleConfirmAction() {
    if (!pendingResume || !confirmAction) return;

    if (confirmAction === "archive") {
      await handleArchive(pendingResume);
      return;
    }

    await handleDelete(pendingResume);
  }

  const formResume = mode === "edit" ? activeResume : undefined;

  return (
    <>
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Резюме</CardTitle>
            <p className="mt-2 text-sm text-[#666]">
              Можно создать до 5 резюме под разные профессии и направления.
            </p>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-[#171717] text-white"
            disabled={resumes.length >= 5 || mode !== "view"}
            onClick={startCreate}
          >
            <FilePlus2 className="h-4 w-4" />
            Создать резюме
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex flex-wrap gap-2">
          {resumes.map((resume) => (
            <button
              key={resume.id}
              type="button"
              className={
                resume.id === activeResume?.id
                  ? "rounded-xl border border-[#171717] bg-[#171717] px-4 py-2 text-left text-sm font-semibold text-white"
                  : "rounded-xl border border-[#161616]/10 bg-[#f7f7f3] px-4 py-2 text-left text-sm font-semibold text-[#333] hover:bg-white"
              }
              onClick={() => {
                setActiveResumeId(resume.id);
                setFormErrors({});
                setMode("view");
              }}
            >
              <span className="flex items-center gap-2">
                <span>{resume.profession || "Резюме"}</span>
                {resume.archived ? (
                  <span className="rounded-lg bg-white/15 px-2 py-0.5 text-xs">
                    Архив
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          <span className="inline-flex items-center rounded-xl border border-[#161616]/10 px-3 py-2 text-sm text-[#777]">
            {resumes.length}/5
          </span>
        </div>

        {mode === "create" || mode === "edit" ? (
          <form
            key={`${mode}-${formResume?.id ?? "new"}`}
            noValidate
            onSubmit={handleSubmit}
            className="grid gap-4 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Input
                  name="profession"
                  defaultValue={formResume?.profession ?? ""}
                  placeholder="Профессия, например Frontend-разработчик"
                  aria-invalid={Boolean(formErrors.profession)}
                  className={fieldControlClass(formErrors.profession)}
                  onChange={() => clearFieldError("profession")}
                />
                <FieldError message={formErrors.profession} />
              </div>
              <Input
                name="city"
                defaultValue={formResume?.city ?? ""}
                placeholder="Город"
              />
              <DictionarySelect
                name="experienceId"
                defaultValue={formResume?.experienceId}
                placeholder="Опыт работы"
                items={dictionaries?.experiences ?? []}
                error={formErrors.experienceId}
                onValueChange={() => clearFieldError("experienceId")}
                required
              />
              <Input
                name="expectedSalaryFrom"
                defaultValue={formResume?.expectedSalaryFrom ?? ""}
                placeholder="Зарплата от"
                type="number"
              />
              <Input
                name="expectedSalaryTo"
                defaultValue={formResume?.expectedSalaryTo ?? ""}
                placeholder="Зарплата до"
                type="number"
              />
              <DictionarySelect
                name="employmentId"
                defaultValue={formResume?.employmentId}
                placeholder="Тип занятости"
                items={dictionaries?.employments ?? []}
                error={formErrors.employmentId}
                onValueChange={() => clearFieldError("employmentId")}
                required
              />
              <DictionarySelect
                name="workFormatId"
                defaultValue={formResume?.workFormatId}
                placeholder="Формат работы"
                items={dictionaries?.workFormats ?? []}
                error={formErrors.workFormatId}
                onValueChange={() => clearFieldError("workFormatId")}
                required
              />
            </div>

            <RichTextEditor
              name="about"
              defaultValue={formResume?.about}
              placeholder="Расскажите о себе, опыте, проектах и целях"
              className={fieldPanelClass(formErrors.about)}
              onChange={() => clearFieldError("about")}
            />
            <FieldError message={formErrors.about} />

            <SkillsSelector
              skills={dictionaries?.skills ?? []}
              selectedSkillIds={selectedSkillIds}
              onChange={handleSkillChange}
              name="skillIds"
              className={fieldPanelClass(formErrors.skillIds)}
            />
            <FieldError message={formErrors.skillIds} />

            <div className="flex flex-wrap gap-2">
              <Button disabled={isSaving} className="rounded-xl bg-[#171717] text-white">
                {isSaving ? "Сохранение..." : "Сохранить резюме"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setFormErrors({});
                  setMode("view");
                }}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : activeResume ? (
          <div className="rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-[#171717]">
                {activeResume.profession || "Резюме"}
                </h2>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#777]">
                  <Clock3 className="h-4 w-4" />
                  Обновлено: {formatDate(activeResume.updatedAt ?? activeResume.createdAt)}
                </p>
                <Badge
                  variant="outline"
                  className="mt-3 rounded-lg bg-white"
                >
                  {activeResume.archived ? "В архиве" : "Активное резюме"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-white"
                  onClick={() => startEdit(activeResume)}
                >
                  <Pencil className="h-4 w-4" />
                  Редактировать
                </Button>
                {activeResume.archived ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl bg-white"
                    disabled={isSaving}
                    onClick={() => void handleRestore(activeResume)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Вернуть
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl bg-white"
                    disabled={isSaving}
                    onClick={() => openConfirm("archive", activeResume)}
                  >
                    <Archive className="h-4 w-4" />
                    В архив
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={isSaving}
                  onClick={() => openConfirm("delete", activeResume)}
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <ResumeMeta
                icon={<MapPin className="h-4 w-4" />}
                label="Город"
                value={activeResume.city || "Не указан"}
              />
              <ResumeMeta
                icon={<Wallet className="h-4 w-4" />}
                label="Зарплата"
                value={formatMoney(
                  activeResume.expectedSalaryFrom,
                  activeResume.expectedSalaryTo,
                )}
              />
              <ResumeMeta
                icon={<BriefcaseBusiness className="h-4 w-4" />}
                label="Занятость"
                value={activeResume.employmentName || "Не указана"}
              />
              <ResumeMeta
                icon={<BriefcaseBusiness className="h-4 w-4" />}
                label="Формат"
                value={activeResume.workFormatName || "Не указан"}
              />
              <ResumeMeta
                icon={<Clock3 className="h-4 w-4" />}
                label="Опыт"
                value={activeResume.experienceName || "Не указан"}
              />
            </div>

            <RichTextContent
              value={activeResume.about}
              fallback="Описание резюме пока не заполнено."
              className="mt-5"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {activeResume.skills?.length ? (
                activeResume.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="rounded-lg bg-white"
                  >
                    {skill.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-[#777]">
                  Навыки пока не добавлены.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#161616]/20 bg-[#f7f7f3] p-6 text-sm text-[#666]">
            Резюме ещё не создано. Создайте первое резюме, чтобы работодатели
            видели профессию, опыт и навыки.
          </div>
        )}
      </CardContent>
      </Card>
      <ResumeConfirmDialog
        action={confirmAction}
        isSaving={isSaving}
        resume={pendingResume}
        onConfirm={handleConfirmAction}
        onOpenChange={(open) => {
          if (!open) closeConfirm();
        }}
      />
    </>
  );
}
