"use client";

import { useState, type FormEvent } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VacancySource, VacancySourcePayload } from "@/lib/api/admin";

import { AdminHeader } from "./AdminHeader";
import { AdminMutedText } from "./AdminMutedText";

interface NewSourceForm {
  code: string;
  name: string;
  baseUrl: string;
  ttlDays: string;
  active: boolean;
  visible: boolean;
}

interface SourceDraft {
  code: string;
  name: string;
  baseUrl: string;
  ttlDays: string;
}

export function VacancySourcesSection({
  sources,
  isLoading,
  isSaving,
  newSource,
  onAdd,
  onDelete,
  onNewSourceChange,
  onUpdate,
}: {
  sources: VacancySource[];
  isLoading: boolean;
  isSaving: boolean;
  newSource: NewSourceForm;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (sourceId: number) => void;
  onNewSourceChange: (source: NewSourceForm) => void;
  onUpdate: (
    source: VacancySource,
    patch: VacancySourcePayload,
  ) => Promise<boolean>;
}) {
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [sourceDraft, setSourceDraft] = useState<SourceDraft>({
    code: "",
    name: "",
    baseUrl: "",
    ttlDays: "",
  });

  function startEdit(source: VacancySource) {
    setEditingSourceId(source.id);
    setSourceDraft({
      code: source.code,
      name: source.name,
      baseUrl: source.baseUrl ?? "",
      ttlDays: String(source.ttlDays),
    });
  }

  function cancelEdit() {
    setEditingSourceId(null);
    setSourceDraft({ code: "", name: "", baseUrl: "", ttlDays: "" });
  }

  async function saveSource(source: VacancySource) {
    const code = sourceDraft.code.trim();
    const name = sourceDraft.name.trim();
    const ttlDays = Number(sourceDraft.ttlDays);

    if (!code || !name) {
      toast.error("Укажите код и название источника.");
      return;
    }

    if (!Number.isFinite(ttlDays) || ttlDays < 1 || ttlDays > 3650) {
      toast.error("TTL должен быть от 1 до 3650 дней.");
      return;
    }

    const saved = await onUpdate(source, {
      code,
      name,
      baseUrl: sourceDraft.baseUrl.trim(),
      ttlDays,
    });

    if (saved) {
      cancelEdit();
    }
  }

  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Источники вакансий"
        title="Настройки источников"
        description="Добавляйте источники, управляйте видимостью вакансий в выдаче и включайте или выключайте агрегацию."
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <form
          onSubmit={onAdd}
          className="grid gap-3 xl:grid-cols-[110px_1fr_1fr_110px_auto_auto_auto]"
        >
          <Input
            value={newSource.code}
            placeholder="CODE"
            className="rounded-xl border-[#161616]/15 uppercase"
            onChange={(event) =>
              onNewSourceChange({
                ...newSource,
                code: event.target.value.toUpperCase(),
              })
            }
          />
          <Input
            value={newSource.name}
            placeholder="Название источника"
            className="rounded-xl border-[#161616]/15"
            onChange={(event) =>
              onNewSourceChange({ ...newSource, name: event.target.value })
            }
          />
          <Input
            value={newSource.baseUrl}
            placeholder="https://example.ru"
            className="rounded-xl border-[#161616]/15"
            onChange={(event) =>
              onNewSourceChange({ ...newSource, baseUrl: event.target.value })
            }
          />
          <Input
            type="number"
            min={1}
            max={3650}
            value={newSource.ttlDays}
            placeholder="TTL"
            className="rounded-xl border-[#161616]/15"
            onChange={(event) =>
              onNewSourceChange({ ...newSource, ttlDays: event.target.value })
            }
          />
          <SourceCheckbox
            label="В выдаче"
            checked={newSource.visible}
            onChange={(visible) => onNewSourceChange({ ...newSource, visible })}
          />
          <SourceCheckbox
            label="Агрегация"
            checked={newSource.active}
            onChange={(active) => onNewSourceChange({ ...newSource, active })}
          />
          <Button
            className="rounded-xl bg-[#171717] text-white"
            disabled={isSaving}
          >
            Добавить
          </Button>
        </form>

        <div className="mt-5 grid gap-3">
          {isLoading ? (
            <AdminMutedText>Загрузка источников...</AdminMutedText>
          ) : sources.length ? (
            sources.map((source) => {
              const isEditing = editingSourceId === source.id;

              return (
                <div
                  key={source.id}
                  className="grid gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4 lg:grid-cols-[1fr_auto_auto_auto_auto_auto] lg:items-center"
                >
                  <div className="min-w-0">
                    {isEditing ? (
                      <div className="grid gap-3 md:grid-cols-[110px_1fr] xl:grid-cols-[110px_1fr_1fr_110px]">
                        <Input
                          value={sourceDraft.code}
                          placeholder="CODE"
                          className="rounded-xl border-[#161616]/15 uppercase"
                          onChange={(event) =>
                            setSourceDraft((current) => ({
                              ...current,
                              code: event.target.value.toUpperCase(),
                            }))
                          }
                        />
                        <Input
                          value={sourceDraft.name}
                          placeholder="Название источника"
                          className="rounded-xl border-[#161616]/15"
                          onChange={(event) =>
                            setSourceDraft((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                        />
                        <Input
                          value={sourceDraft.baseUrl}
                          placeholder="https://example.ru"
                          className="rounded-xl border-[#161616]/15"
                          onChange={(event) =>
                            setSourceDraft((current) => ({
                              ...current,
                              baseUrl: event.target.value,
                            }))
                          }
                        />
                        <Input
                          type="number"
                          min={1}
                          max={3650}
                          value={sourceDraft.ttlDays}
                          placeholder="TTL"
                          className="rounded-xl border-[#161616]/15"
                          onChange={(event) =>
                            setSourceDraft((current) => ({
                              ...current,
                              ttlDays: event.target.value,
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#171717] px-2.5 py-1 text-xs font-extrabold text-white">
                            {source.code}
                          </span>
                          <h3 className="text-base font-extrabold text-[#171717]">
                            {source.name}
                          </h3>
                        </div>
                        <p className="mt-2 truncate text-sm text-[#686868]">
                          {source.baseUrl || "Base URL не указан"}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#777]">
                          TTL: {source.ttlDays} дн. · Вакансий:{" "}
                          {source.vacanciesCount}
                        </p>
                      </>
                    )}
                  </div>

                  <SourceCheckbox
                    label="В выдаче"
                    checked={source.visible}
                    disabled={isSaving || isEditing}
                    onChange={(visible) => void onUpdate(source, { visible })}
                  />
                  <SourceCheckbox
                    label="Агрегация"
                    checked={source.active}
                    disabled={isSaving || isEditing}
                    onChange={(active) => void onUpdate(source, { active })}
                  />

                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl p-0 text-emerald-700 hover:bg-emerald-50"
                        disabled={isSaving}
                        onClick={() => void saveSource(source)}
                        title="Сохранить"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl p-0 text-[#555] hover:bg-white"
                        disabled={isSaving}
                        onClick={cancelEdit}
                        title="Отменить"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl p-0 text-[#171717] hover:bg-white"
                        disabled={isSaving}
                        onClick={() => startEdit(source)}
                        title="Редактировать источник"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 rounded-xl p-0 text-red-700 hover:bg-red-50"
                        disabled={isSaving}
                        onClick={() => onDelete(source.id)}
                        title={
                          source.vacanciesCount > 0
                            ? "Источник используется вакансиями"
                            : "Удалить источник"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              );
            })
          ) : (
            <AdminMutedText>
              Источники вакансий пока не настроены.
            </AdminMutedText>
          )}
        </div>
      </div>
    </section>
  );
}

function SourceCheckbox({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-xl border border-[#161616]/10 bg-white px-3 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

export type { NewSourceForm };
