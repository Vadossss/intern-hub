"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Archive, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmployerVacancyCard } from "@/components/shared/profile/EmployerVacancyCard";
import { EmployerVacancyForm } from "@/components/shared/profile/EmployerVacancyForm";
import { EmployerVacancyFormSkeleton } from "@/components/shared/profile/EmployerVacancyFormSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VacancyFormDictionaries } from "@/lib/api/dictionaries";
import type {
  EmployerVacancy,
  VacancyContact,
  VacancyPayload,
} from "@/lib/api/profile";

type VacancyTab = "active" | "review" | "archived";
type VacancyMode = "view" | "create" | "edit";
type ConfirmAction = "archive" | "restore" | "delete";

const emptyDictionaries: VacancyFormDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  directions: [],
  skills: [],
  languages: [],
};

const vacancyTabs: Array<{ id: VacancyTab; label: string; empty: string }> = [
  {
    id: "active",
    label: "Активные",
    empty: "Активных вакансий пока нет.",
  },
  {
    id: "review",
    label: "На проверке",
    empty: "Вакансий на проверке пока нет.",
  },
  {
    id: "archived",
    label: "В архиве",
    empty: "В архиве пока нет вакансий.",
  },
];

function createEmptyContact(): VacancyContact {
  return {
    chosenContactMethod: "INTERNAL_CHAT",
    contactValue: "",
    hint: "",
  };
}

function textValue(value: FormDataEntryValue | null) {
  return value === null ? "" : String(value);
}

function optionalNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeContacts(contacts?: VacancyContact[]) {
  if (!contacts?.length) {
    return [createEmptyContact()];
  }

  let hasInternalContact = false;

  return contacts
    .map((contact) => ({
      chosenContactMethod: contact.chosenContactMethod || "INTERNAL_CHAT",
      contactValue: contact.contactValue || "",
      hint: contact.hint || "",
    }))
    .filter((contact) => {
      if (contact.chosenContactMethod !== "INTERNAL_CHAT") {
        return true;
      }

      if (hasInternalContact) {
        return false;
      }

      hasInternalContact = true;
      return true;
    });
}

function buildVacancyPayload(
  formData: FormData,
  contacts: VacancyContact[],
  selectedSkillIds: number[],
): VacancyPayload {
  let hasInternalContact = false;
  const contactsList = contacts
    .map((contact) => ({
      chosenContactMethod: contact.chosenContactMethod || "INTERNAL_CHAT",
      contactValue: contact.contactValue.trim(),
      hint: contact.hint?.trim() || "",
    }))
    .filter(
      (contact) =>
        contact.chosenContactMethod === "INTERNAL_CHAT" ||
        contact.contactValue.length > 0,
    )
    .filter((contact) => {
      if (contact.chosenContactMethod !== "INTERNAL_CHAT") {
        return true;
      }

      if (hasInternalContact) {
        return false;
      }

      hasInternalContact = true;
      return true;
    });

  return {
    title: textValue(formData.get("title")),
    direction: textValue(formData.get("direction")),
    description: textValue(formData.get("description")),
    city: textValue(formData.get("city")),
    link: textValue(formData.get("link")),
    employment: textValue(formData.get("employment")),
    experience: textValue(formData.get("experience")),
    workFormat: textValue(formData.get("workFormat")),
    skills: selectedSkillIds,
    salary: {
      from: optionalNumber(formData.get("salaryFrom")),
      to: optionalNumber(formData.get("salaryTo")),
      currency: textValue(formData.get("currency")) || "RUR",
    },
    contactsList,
  };
}

export function EmployerVacanciesSection({
  vacancies,
  dictionaries,
  isSaving,
  onCreate,
  onUpdate,
  onArchive,
  onRestore,
  onDelete,
  onLoadVacancy,
  onOpenApplications,
}: {
  vacancies: EmployerVacancy[];
  dictionaries: VacancyFormDictionaries | null;
  isSaving: boolean;
  onCreate: (payload: VacancyPayload) => Promise<EmployerVacancy>;
  onUpdate: (
    publicId: string,
    payload: VacancyPayload,
  ) => Promise<EmployerVacancy>;
  onArchive: (vacancy: EmployerVacancy) => Promise<void>;
  onRestore: (vacancy: EmployerVacancy) => Promise<void>;
  onDelete: (vacancy: EmployerVacancy) => Promise<void>;
  onLoadVacancy: (publicId: string) => Promise<EmployerVacancy>;
  onOpenApplications: (publicId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<VacancyTab>("active");
  const [mode, setMode] = useState<VacancyMode>("view");
  const [formVacancy, setFormVacancy] = useState<EmployerVacancy | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [contacts, setContacts] = useState<VacancyContact[]>([
    createEmptyContact(),
  ]);
  const [isCreatePreparing, setIsCreatePreparing] = useState(false);
  const [loadingVacancyId, setLoadingVacancyId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );

  const formDictionaries = dictionaries ?? emptyDictionaries;
  const isEditMode = mode === "edit";
  const isArchived = formVacancy?.status?.toUpperCase() === "ARCHIVED";
  const showFormSkeleton =
    mode !== "view" &&
    (isCreatePreparing || !dictionaries || (isEditMode && !formVacancy));

  const vacancyGroups = useMemo(
    () => ({
      active: vacancies.filter(isActiveVacancy),
      review: vacancies.filter(isReviewVacancy),
      archived: vacancies.filter(isArchivedVacancy),
    }),
    [vacancies],
  );
  const visibleVacancies = vacancyGroups[activeTab];
  const activeTabConfig = vacancyTabs.find((tab) => tab.id === activeTab);

  useEffect(() => {
    if (!isCreatePreparing) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsCreatePreparing(false);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isCreatePreparing]);

  function startCreate() {
    setMode("create");
    setFormVacancy(null);
    setSelectedSkillIds([]);
    setContacts([createEmptyContact()]);
    setIsCreatePreparing(true);
  }

  async function startEdit(vacancy: EmployerVacancy) {
    try {
      setMode("edit");
      setIsCreatePreparing(false);
      setFormVacancy(null);
      setSelectedSkillIds([]);
      setContacts([createEmptyContact()]);
      setLoadingVacancyId(vacancy.publicId);
      const loadedVacancy = await onLoadVacancy(vacancy.publicId);
      setFormVacancy(loadedVacancy);
      setSelectedSkillIds(
        (loadedVacancy.skills ?? []).map((skill) => skill.id),
      );
      setContacts(normalizeContacts(loadedVacancy.contacts));
    } catch (error) {
      console.error("Failed to load vacancy for edit:", error);
      toast.error("Не удалось загрузить вакансию для редактирования.");
      cancelForm();
    } finally {
      setLoadingVacancyId(null);
    }
  }

  function cancelForm() {
    setMode("view");
    setIsCreatePreparing(false);
    setFormVacancy(null);
    setSelectedSkillIds([]);
    setContacts([createEmptyContact()]);
    setConfirmAction(null);
  }

  function addContact() {
    setContacts((currentContacts) => [
      ...currentContacts,
      { chosenContactMethod: "EMAIL", contactValue: "", hint: "" },
    ]);
  }

  function updateContact(
    index: number,
    field: keyof VacancyContact,
    value: string,
  ) {
    setContacts((currentContacts) => {
      if (
        field === "chosenContactMethod" &&
        value === "INTERNAL_CHAT" &&
        currentContacts.some(
          (contact, contactIndex) =>
            contactIndex !== index &&
            contact.chosenContactMethod === "INTERNAL_CHAT",
        )
      ) {
        toast.error("Внутренний отклик можно добавить только один раз.");
        return currentContacts;
      }

      return currentContacts.map((contact, contactIndex) =>
        contactIndex === index
          ? {
              ...contact,
              [field]: value,
              ...(field === "chosenContactMethod" && value === "INTERNAL_CHAT"
                ? { contactValue: "" }
                : {}),
            }
          : contact,
      );
    });
  }

  function removeContact(index: number) {
    setContacts((currentContacts) => {
      const nextContacts = currentContacts.filter(
        (_contact, contactIndex) => contactIndex !== index,
      );

      return nextContacts.length ? nextContacts : [createEmptyContact()];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildVacancyPayload(
      new FormData(event.currentTarget),
      contacts,
      selectedSkillIds,
    );

    if (!payload.title.trim()) {
      toast.error("Название вакансии обязательно.");
      return;
    }

    try {
      const saved =
        mode === "create"
          ? await onCreate(payload)
          : formVacancy
            ? await onUpdate(formVacancy.publicId, payload)
            : null;

      if (saved) {
        cancelForm();
      }
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  async function handleConfirmAction() {
    if (!formVacancy || !confirmAction) return;

    try {
      if (confirmAction === "archive") {
        await onArchive(formVacancy);
      } else if (confirmAction === "restore") {
        await onRestore(formVacancy);
      } else {
        await onDelete(formVacancy);
      }

      cancelForm();
    } catch {
      // Toast is shown by the parent handler.
    }
  }

  return (
    <>
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Вакансии</CardTitle>
              {mode !== "view" ? (
                <p className="mt-2 text-sm text-[#626262]">
                  {isEditMode
                    ? "Редактирование вакансии внутри профиля."
                    : "Создание вакансии внутри профиля работодателя."}
                </p>
              ) : null}
            </div>
            {mode === "view" ? (
              <Button
                type="button"
                className="w-fit rounded-xl bg-[#171717] text-white"
                onClick={startCreate}
              >
                <Plus className="h-4 w-4" />
                Создать вакансию
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mode === "view" ? (
            <>
              <div className="grid gap-2 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-1 sm:grid-cols-3">
                {vacancyTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`rounded-xl px-4 py-3 text-left transition ${
                      activeTab === tab.id
                        ? "bg-[#171717] text-white shadow-sm"
                        : "text-[#555] hover:bg-white"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="block text-sm font-extrabold">
                      {tab.label}
                    </span>
                    <span
                      className={`mt-1 block text-xs ${
                        activeTab === tab.id ? "text-white/65" : "text-[#777]"
                      }`}
                    >
                      {vacancyGroups[tab.id].length} вакансий
                    </span>
                  </button>
                ))}
              </div>

              {visibleVacancies.length ? (
                visibleVacancies.map((vacancy) => (
                  <EmployerVacancyCard
                    key={vacancy.publicId}
                    vacancy={vacancy}
                    isLoading={loadingVacancyId === vacancy.publicId}
                    onEdit={(item) => void startEdit(item)}
                    onOpenApplications={onOpenApplications}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] p-6 text-sm text-[#626262]">
                  {activeTabConfig?.empty}
                </div>
              )}
            </>
          ) : showFormSkeleton ? (
            <EmployerVacancyFormSkeleton />
          ) : (
            <EmployerVacancyForm
              key={`${mode}-${formVacancy?.publicId ?? "new"}`}
              contacts={contacts}
              dictionaries={formDictionaries}
              isArchived={isArchived}
              isDictionaryLoading={!dictionaries}
              isEditMode={isEditMode}
              isSaving={isSaving}
              selectedSkillIds={selectedSkillIds}
              vacancy={formVacancy}
              onAddContact={addContact}
              onArchive={() => setConfirmAction("archive")}
              onRestore={() => setConfirmAction("restore")}
              onCancel={cancelForm}
              onDelete={() => setConfirmAction("delete")}
              onRemoveContact={removeContact}
              onSelectedSkillsChange={setSelectedSkillIds}
              onSubmit={handleSubmit}
              onUpdateContact={updateContact}
            />
          )}
        </CardContent>
      </Card>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open && !isSaving) {
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmTitle(confirmAction)}</DialogTitle>
            <DialogDescription>
              {confirmDescription(confirmAction, formVacancy)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setConfirmAction(null)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className={
                confirmAction === "delete"
                  ? "rounded-xl bg-red-700 text-white hover:bg-red-800"
                  : "rounded-xl bg-[#171717] text-white hover:bg-black"
              }
              onClick={handleConfirmAction}
              disabled={isSaving}
            >
              {confirmAction === "restore" ? (
                <RotateCcw className="h-4 w-4" />
              ) : confirmAction === "archive" ? (
                <Archive className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isSaving ? "Выполнение..." : confirmButtonLabel(confirmAction)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function confirmTitle(action: ConfirmAction | null) {
  if (action === "archive") return "Архивировать вакансию?";
  if (action === "restore") return "Вернуть вакансию в активные?";
  return "Удалить вакансию?";
}

function confirmDescription(
  action: ConfirmAction | null,
  vacancy: EmployerVacancy | null,
) {
  const title = vacancy?.title ?? "без названия";
  if (action === "archive") {
    return `Вакансия "${title}" уйдет в архив и перестанет отображаться в активных вакансиях.`;
  }
  if (action === "restore") {
    return `Вакансия "${title}" снова станет активной и будет доступна кандидатам.`;
  }
  return `Вакансия "${title}" будет удалена без возможности восстановления.`;
}

function confirmButtonLabel(action: ConfirmAction | null) {
  if (action === "archive") return "Да, архивировать";
  if (action === "restore") return "Да, вернуть";
  return "Да, удалить";
}

function normalizedStatus(status?: string) {
  return status?.toUpperCase() ?? "";
}

function isActiveVacancy(vacancy: EmployerVacancy) {
  return ["ACTIVE", "APPROVED"].includes(normalizedStatus(vacancy.status));
}

function isArchivedVacancy(vacancy: EmployerVacancy) {
  return normalizedStatus(vacancy.status) === "ARCHIVED";
}

function isReviewVacancy(vacancy: EmployerVacancy) {
  return !isActiveVacancy(vacancy) && !isArchivedVacancy(vacancy);
}
