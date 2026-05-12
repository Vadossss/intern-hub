"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DictionaryItem } from "@/lib/api/dictionaries";
import type { CandidateResumeWorkExperience } from "@/lib/api/profile";

export interface ResumeWorkExperienceEditorRef {
  getItems: () => CandidateResumeWorkExperience[];
}

interface ResumeWorkExperienceEditorProps {
  initialItems: CandidateResumeWorkExperience[];
  workFormats: DictionaryItem[];
}

export const ResumeWorkExperienceEditor = forwardRef<
  ResumeWorkExperienceEditorRef,
  ResumeWorkExperienceEditorProps
>(function ResumeWorkExperienceEditor({ initialItems, workFormats }, ref) {
  const [items, setItems] = useState<CandidateResumeWorkExperience[]>(
    () => initialItems.map((item) => ({ ...item })),
  );

  useImperativeHandle(
    ref,
    () => ({
      getItems: () => items,
    }),
    [items],
  );

  function updateItem(index: number, patch: CandidateResumeWorkExperience) {
    setItems(
      items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <section className="grid gap-3 rounded-2xl border border-[#161616]/10 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#171717]">Опыт работы</h3>
          <p className="mt-1 text-sm text-[#666]">
            Добавьте компанию, должность, формат работы и период.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl bg-[#f7f7f3]"
          onClick={() =>
            setItems([
              ...items,
              {
                company: "",
                position: "",
                workFormatId: "",
                startDate: "",
                endDate: "",
                currentlyWorking: false,
                projectUrl: "",
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {items.length ? (
        <div className="grid gap-3">
          {items.map((item, index) => (
            <div
              key={`${item.id ?? "new"}-${index}`}
              className="grid gap-3 rounded-xl border border-[#161616]/10 bg-[#f7f7f3] p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={item.company ?? ""}
                  placeholder="Компания"
                  onChange={(event) =>
                    updateItem(index, { company: event.target.value })
                  }
                />
                <Input
                  value={item.position ?? ""}
                  placeholder="Должность"
                  onChange={(event) =>
                    updateItem(index, { position: event.target.value })
                  }
                />
                <select
                  value={item.workFormatId ?? ""}
                  className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#333] shadow-sm outline-none transition focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                  onChange={(event) =>
                    updateItem(index, { workFormatId: event.target.value })
                  }
                >
                  <option value="">Формат работы</option>
                  {workFormats.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.name}
                    </option>
                  ))}
                </select>
                <Input
                  value={item.projectUrl ?? ""}
                  placeholder="Ссылка на проект"
                  onChange={(event) =>
                    updateItem(index, { projectUrl: event.target.value })
                  }
                />
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-white px-3 text-sm font-medium text-[#333]">
                  <input
                    type="checkbox"
                    checked={Boolean(item.currentlyWorking)}
                    onChange={(event) =>
                      updateItem(index, {
                        currentlyWorking: event.target.checked,
                        endDate: event.target.checked ? "" : item.endDate,
                      })
                    }
                  />
                  Работаю сейчас
                </label>
                <Input
                  type="date"
                  value={item.startDate ?? ""}
                  onChange={(event) =>
                    updateItem(index, { startDate: event.target.value })
                  }
                />
                <Input
                  type="date"
                  value={item.currentlyWorking ? "" : (item.endDate ?? "")}
                  disabled={Boolean(item.currentlyWorking)}
                  onChange={(event) =>
                    updateItem(index, { endDate: event.target.value })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() =>
                    setItems(items.filter((_, currentIndex) => currentIndex !== index))
                  }
                >
                  <X className="h-4 w-4" />
                  Удалить
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#161616]/15 bg-[#f7f7f3] p-3 text-sm text-[#777]">
          Опыт работы пока не добавлен.
        </p>
      )}
    </section>
  );
});
