"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/shared/RichText";
import { CandidateResumeCard } from "@/components/shared/profile/CandidateResumeCard";
import { CandidateResumePreviewDialog } from "@/components/shared/profile/CandidateResumePreviewDialog";
import { CandidateResumeStatsDialog } from "@/components/shared/profile/CandidateResumeStatsDialog";
import { SkillsSelector } from "@/components/shared/SkillsSelector";
import {
  DictionarySelect,
  FieldError,
  ResumeConfirmDialog,
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
import {
  ResumeEducationEditor,
  type ResumeEducationEditorRef,
} from "@/components/shared/profile/ResumeEducationEditor";
import {
  ResumeLanguagesEditor,
  type ResumeLanguagesEditorRef,
} from "@/components/shared/profile/ResumeLanguagesEditor";
import {
  ResumeWorkExperienceEditor,
  type ResumeWorkExperienceEditorRef,
} from "@/components/shared/profile/ResumeWorkExperienceEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { VacancyFormDictionaries } from "@/lib/api/dictionaries";
import type {
  CandidateResume,
  CandidateResumeEducation,
  CandidateResumeLanguage,
  CandidateResumePayload,
  CandidateResumeWorkExperience,
} from "@/lib/api/profile";
import { numberValue, textValue } from "@/components/shared/profile/utils";

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
  dictionaries: VacancyFormDictionaries | null;
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
  const languagesEditorRef = useRef<ResumeLanguagesEditorRef>(null);
  const educationEditorRef = useRef<ResumeEducationEditorRef>(null);
  const workExperienceEditorRef = useRef<ResumeWorkExperienceEditorRef>(null);
  const [formErrors, setFormErrors] = useState<ResumeFormErrors>({});
  const [confirmAction, setConfirmAction] =
    useState<ResumeConfirmAction | null>(null);
  const [pendingResume, setPendingResume] = useState<CandidateResume | null>(
    null,
  );
  const [statsResume, setStatsResume] = useState<CandidateResume | null>(null);
  const [previewResume, setPreviewResume] = useState<CandidateResume | null>(
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
      expectedSalaryFrom: numberValue(formData.get("expectedSalaryFrom")),
      expectedSalaryTo: numberValue(formData.get("expectedSalaryTo")),
      employmentId: textValue(formData.get("employmentId")),
      workFormatId: textValue(formData.get("workFormatId")),
      experienceId: textValue(formData.get("experienceId")),
      about: textValue(formData.get("about")),
      skillIds: selectedSkillIds,
      languages: sanitizeLanguages(languagesEditorRef.current?.getItems() ?? []),
      education: sanitizeEducation(educationEditorRef.current?.getItems() ?? []),
      workExperience: sanitizeWorkExperience(
        workExperienceEditorRef.current?.getItems() ?? [],
      ),
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

            <ResumeLanguagesEditor
              ref={languagesEditorRef}
              initialItems={formResume?.languages ?? []}
              languages={dictionaries?.languages ?? []}
            />
            <ResumeEducationEditor
              ref={educationEditorRef}
              initialItems={formResume?.education ?? []}
            />
            <ResumeWorkExperienceEditor
              ref={workExperienceEditorRef}
              initialItems={formResume?.workExperience ?? []}
              workFormats={dictionaries?.workFormats ?? []}
            />

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
        ) : resumes.length ? (
          <div className="grid gap-3">
            {resumes.map((resume) => (
              <CandidateResumeCard
                key={resume.id}
                resume={resume}
                isSaving={isSaving}
                onArchive={(item) => openConfirm("archive", item)}
                onDelete={(item) => openConfirm("delete", item)}
                onEdit={startEdit}
                onPreview={setPreviewResume}
                onRestore={(item) => void handleRestore(item)}
                onStats={setStatsResume}
              />
            ))}
            <div className="rounded-2xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] px-4 py-3 text-sm text-[#626262]">
              Резюме: {resumes.length}/5
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
      <CandidateResumeStatsDialog
        open={Boolean(statsResume)}
        resume={statsResume}
        onOpenChange={(open) => {
          if (!open) setStatsResume(null);
        }}
      />
      <CandidateResumePreviewDialog
        open={Boolean(previewResume)}
        resume={previewResume}
        onOpenChange={(open) => {
          if (!open) setPreviewResume(null);
        }}
      />
    </>
  );
}

function sanitizeLanguages(items: CandidateResumeLanguage[]) {
  return items
    .map((item) => ({
      id: item.id,
      languageId: item.languageId?.trim(),
      level: item.level?.trim(),
    }))
    .filter((item) => item.languageId || item.level);
}

function sanitizeEducation(items: CandidateResumeEducation[]) {
  return items
    .map((item) => ({
      id: item.id,
      institution: item.institution?.trim(),
      specialty: item.specialty?.trim(),
      educationLevel: item.educationLevel?.trim(),
      startDate: item.startDate || undefined,
      endDate: item.endDate || undefined,
      currentlyStudying: Boolean(item.currentlyStudying),
    }))
    .filter(
      (item) =>
        item.institution ||
        item.specialty ||
        item.educationLevel ||
        item.startDate ||
        item.endDate ||
        item.currentlyStudying,
    );
}

function sanitizeWorkExperience(items: CandidateResumeWorkExperience[]) {
  return items
    .map((item) => {
      const hasEndDate = Boolean(item.endDate);

      return {
        id: item.id,
        company: item.company?.trim(),
        position: item.position?.trim(),
        workFormatId: item.workFormatId?.trim(),
        startDate: item.startDate || undefined,
        endDate: hasEndDate ? item.endDate : undefined,
        currentlyWorking: Boolean(item.currentlyWorking) || !hasEndDate,
        projectUrl: item.projectUrl?.trim() || undefined,
      };
    })
    .filter(
      (item) =>
        item.company ||
        item.position ||
        item.workFormatId ||
        item.startDate ||
        item.endDate ||
        item.projectUrl,
    );
}
