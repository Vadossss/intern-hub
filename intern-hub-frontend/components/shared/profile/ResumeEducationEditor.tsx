"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CandidateResumeEducation } from "@/lib/api/profile";

const educationLevels = [
  "Среднее",
  "Среднее специальное",
  "Неоконченное высшее",
  "Высшее",
  "Бакалавриат",
  "Магистратура",
  "Аспирантура",
  "Курсы",
];

export interface ResumeEducationEditorRef {
  getItems: () => CandidateResumeEducation[];
}

interface ResumeEducationEditorProps {
  initialItems: CandidateResumeEducation[];
}

export const ResumeEducationEditor = forwardRef<
  ResumeEducationEditorRef,
  ResumeEducationEditorProps
>(function ResumeEducationEditor({ initialItems }, ref) {
  const [items, setItems] = useState<CandidateResumeEducation[]>(
    () => initialItems.map((item) => ({ ...item })),
  );

  useImperativeHandle(
    ref,
    () => ({
      getItems: () => items,
    }),
    [items],
  );

  function updateItem(index: number, patch: CandidateResumeEducation) {
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
          <h3 className="text-base font-extrabold text-[#171717]">Образование</h3>
          <p className="mt-1 text-sm text-[#666]">
            Добавьте учебное заведение, специальность и период обучения.
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
                institution: "",
                specialty: "",
                educationLevel: "",
                startDate: "",
                endDate: "",
                currentlyStudying: false,
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
                  value={item.institution ?? ""}
                  placeholder="Учебное заведение"
                  onChange={(event) =>
                    updateItem(index, { institution: event.target.value })
                  }
                />
                <Input
                  value={item.specialty ?? ""}
                  placeholder="Специальность"
                  onChange={(event) =>
                    updateItem(index, { specialty: event.target.value })
                  }
                />
                <select
                  value={item.educationLevel ?? ""}
                  className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#333] shadow-sm outline-none transition focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                  onChange={(event) =>
                    updateItem(index, { educationLevel: event.target.value })
                  }
                >
                  <option value="">Уровень образования</option>
                  {educationLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                <label className="flex h-10 items-center gap-2 rounded-md border border-input bg-white px-3 text-sm font-medium text-[#333]">
                  <input
                    type="checkbox"
                    checked={Boolean(item.currentlyStudying)}
                    onChange={(event) =>
                      updateItem(index, {
                        currentlyStudying: event.target.checked,
                      })
                    }
                  />
                  Учусь сейчас
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
                  value={item.endDate ?? ""}
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
          Образование пока не добавлено.
        </p>
      )}
    </section>
  );
});
