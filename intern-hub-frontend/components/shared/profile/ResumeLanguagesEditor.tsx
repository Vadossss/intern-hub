"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DictionaryItem } from "@/lib/api/dictionaries";
import type { CandidateResumeLanguage } from "@/lib/api/profile";

const languageLevels = [
  { value: "A1", label: "A1 (понимаю и использую простые фразы)" },
  { value: "A2", label: "A2 (общаюсь в простых бытовых ситуациях)" },
  { value: "B1", label: "B1 (поддерживаю разговор на знакомые темы)" },
  { value: "B2", label: "B2 (уверенно общаюсь и работаю с текстами)" },
  { value: "C1", label: "C1 (свободно использую язык в работе)" },
  { value: "C2", label: "C2 (владею почти как родным)" },
  { value: "NATIVE", label: "Носитель (родной язык)" },
];

export interface ResumeLanguagesEditorRef {
  getItems: () => CandidateResumeLanguage[];
}

interface ResumeLanguagesEditorProps {
  initialItems: CandidateResumeLanguage[];
  languages: DictionaryItem[];
}

export const ResumeLanguagesEditor = forwardRef<
  ResumeLanguagesEditorRef,
  ResumeLanguagesEditorProps
>(function ResumeLanguagesEditor({ initialItems, languages }, ref) {
  const [items, setItems] = useState<CandidateResumeLanguage[]>(
    () => initialItems.map((item) => ({ ...item })),
  );

  useImperativeHandle(
    ref,
    () => ({
      getItems: () => items,
    }),
    [items],
  );

  function updateItem(index: number, patch: CandidateResumeLanguage) {
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
          <h3 className="text-base font-extrabold text-[#171717]">Языки</h3>
          <p className="mt-1 text-sm text-[#666]">
            Укажите язык и уровень владения.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl bg-[#f7f7f3]"
          disabled={!languages.length}
          onClick={() =>
            setItems([...items, { languageId: "", level: "" }])
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
              className="grid gap-3 rounded-xl border border-[#161616]/10 bg-[#f7f7f3] p-3 lg:grid-cols-[1fr_1.4fr_auto]"
            >
              <select
                value={item.languageId ?? ""}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#333] shadow-sm outline-none transition focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                disabled={!languages.length}
                onChange={(event) =>
                  updateItem(index, { languageId: event.target.value })
                }
              >
                <option value="">Выберите язык</option>
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
              <select
                value={item.level ?? ""}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm text-[#333] shadow-sm outline-none transition focus:border-ring focus:ring-ring/50 focus:ring-[3px]"
                onChange={(event) =>
                  updateItem(index, { level: event.target.value })
                }
              >
                <option value="">Уровень</option>
                {languageLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() =>
                  setItems(items.filter((_, currentIndex) => currentIndex !== index))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#161616]/15 bg-[#f7f7f3] p-3 text-sm text-[#777]">
          Языки пока не добавлены.
        </p>
      )}
    </section>
  );
});
