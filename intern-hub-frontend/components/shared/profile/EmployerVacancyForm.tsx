"use client";

import type { FormEvent } from "react";
import { Archive, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";

import { CityAutocompleteInput } from "@/components/shared/CityAutocompleteInput";
import { SkillsSelector } from "@/components/shared/SkillsSelector";
import { statusLabel } from "@/components/shared/profile/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  DictionaryItem,
  VacancyFormDictionaries,
} from "@/lib/api/dictionaries";
import type { EmployerVacancy, VacancyContact } from "@/lib/api/profile";

const contactMethodOptions = [
  { value: "INTERNAL_CHAT", label: "Отклик внутри сайта" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Телефон" },
  { value: "TELEGRAM", label: "Telegram" },
  { value: "HH", label: "HeadHunter" },
  { value: "SJ", label: "SuperJob" },
  { value: "EXTERNAL_LINK", label: "Внешняя ссылка" },
];

function optionValue(
  options: DictionaryItem[] = [],
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

export function EmployerVacancyForm({
  contacts,
  dictionaries,
  isArchived,
  isDictionaryLoading,
  isEditMode,
  isSaving,
  selectedSkillIds,
  vacancy,
  onAddContact,
  onArchive,
  onCancel,
  onDelete,
  onRestore,
  onRemoveContact,
  onSelectedSkillsChange,
  onSubmit,
  onUpdateContact,
}: {
  contacts: VacancyContact[];
  dictionaries: VacancyFormDictionaries;
  isArchived: boolean;
  isDictionaryLoading: boolean;
  isEditMode: boolean;
  isSaving: boolean;
  selectedSkillIds: number[];
  vacancy: EmployerVacancy | null;
  onAddContact: () => void;
  onArchive: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onRemoveContact: (index: number) => void;
  onSelectedSkillsChange: (ids: number[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdateContact: (
    index: number,
    field: keyof VacancyContact,
    value: string,
  ) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#171717]">
            {isEditMode ? "Редактирование вакансии" : "Новая вакансия"}
          </h3>
          {isEditMode && vacancy ? (
            <p className="mt-1 text-sm text-[#626262]">
              Статус: {statusLabel(vacancy.status)}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-white"
                disabled={isSaving}
                onClick={isArchived ? onRestore : onArchive}
              >
                {isArchived ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                {isArchived ? "Вернуть в активные" : "Архивировать"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                disabled={isSaving}
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </Button>
            </>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-white"
            disabled={isSaving}
            onClick={onCancel}
          >
            Отмена
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="title"
          defaultValue={vacancy?.title}
          placeholder="Название вакансии"
          required
        />
        <select
          name="direction"
          defaultValue={optionValue(
            dictionaries.directions,
            vacancy?.directionId ?? vacancy?.direction,
          )}
          className="h-10 rounded-md border bg-white px-3 text-sm"
          required
        >
          <option value="" disabled>
            Направление
          </option>
          {dictionaries.directions.map((direction) => (
            <option key={direction.id} value={direction.id}>
              {direction.name}
            </option>
          ))}
        </select>
        <CityAutocompleteInput
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
          defaultValue={optionValue(dictionaries.currencies, vacancy?.currency, "RUR")}
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
        onChange={onSelectedSkillsChange}
        name="skills"
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-[#171717]">
              Способы отклика
            </h3>
            <p className="mt-1 text-sm text-[#626262]">
              Добавьте внутренний отклик, email, телефон, Telegram или внешнюю ссылку.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit rounded-xl bg-white"
            onClick={onAddContact}
          >
            <Plus className="h-4 w-4" />
            Добавить способ
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {contacts.map((contact, index) => {
            const isInternal =
              contact.chosenContactMethod === "INTERNAL_CHAT";
            const hasAnotherInternalContact = contacts.some(
              (item, itemIndex) =>
                itemIndex !== index &&
                item.chosenContactMethod === "INTERNAL_CHAT",
            );

            return (
              <div
                key={`contact-${index}`}
                className="grid gap-3 rounded-xl border border-[#161616]/10 bg-[#f7f7f3] p-3 lg:grid-cols-[13rem_1fr_1fr_auto]"
              >
                <select
                  value={contact.chosenContactMethod}
                  className="h-10 rounded-md border bg-white px-3 text-sm"
                  onChange={(event) =>
                    onUpdateContact(
                      index,
                      "chosenContactMethod",
                      event.target.value,
                    )
                  }
                >
                  {contactMethodOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={
                        option.value === "INTERNAL_CHAT" &&
                        hasAnotherInternalContact
                      }
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <Input
                  value={contact.contactValue}
                  placeholder={
                    isInternal
                      ? "Необязательно"
                      : "Контакт, ссылка или логин"
                  }
                  disabled={isInternal}
                  onChange={(event) =>
                    onUpdateContact(index, "contactValue", event.target.value)
                  }
                />

                <Input
                  value={contact.hint || ""}
                  placeholder="Подсказка для кандидата"
                  onChange={(event) =>
                    onUpdateContact(index, "hint", event.target.value)
                  }
                />

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onRemoveContact(index)}
                  aria-label="Удалить способ отклика"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        disabled={isSaving || isDictionaryLoading}
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
  );
}
