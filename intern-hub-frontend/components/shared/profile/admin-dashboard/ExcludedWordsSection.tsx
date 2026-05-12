"use client";

import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VacancyExcludedWord } from "@/lib/api/admin";

import { AdminHeader } from "./AdminHeader";
import { AdminMutedText } from "./AdminMutedText";

export function ExcludedWordsSection({
  excludedWords,
  isLoading,
  isSaving,
  newWord,
  newWordActive,
  onAdd,
  onNewWordActiveChange,
  onNewWordChange,
  onRemove,
  onToggle,
}: {
  excludedWords: VacancyExcludedWord[];
  isLoading: boolean;
  isSaving: boolean;
  newWord: string;
  newWordActive: boolean;
  onAdd: (event: FormEvent<HTMLFormElement>) => void;
  onNewWordActiveChange: (value: boolean) => void;
  onNewWordChange: (value: string) => void;
  onRemove: (wordId: number) => void;
  onToggle: (word: VacancyExcludedWord) => void;
}) {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Правила агрегации"
        title="Стоп-слова вакансий"
        description="Управляйте словами, по которым агрегатор отсекает нерелевантные вакансии."
      />

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <form onSubmit={onAdd} className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <Input
            value={newWord}
            placeholder="Например, продавец"
            className="rounded-xl border-[#161616]/15"
            onChange={(event) => onNewWordChange(event.target.value)}
          />
          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] px-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={newWordActive}
              onChange={(event) => onNewWordActiveChange(event.target.checked)}
            />
            Активно
          </label>
          <Button className="rounded-xl bg-[#171717] text-white" disabled={isSaving}>
            Добавить
          </Button>
        </form>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <AdminMutedText>Загрузка стоп-слов...</AdminMutedText>
          ) : excludedWords.length ? (
            excludedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] px-3 py-2"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  disabled={isSaving}
                  onClick={() => onToggle(word)}
                >
                  <span className="block truncate text-sm font-extrabold text-[#171717]">
                    {word.word}
                  </span>
                  <span className="text-xs font-semibold text-[#777]">
                    {word.active ? "Активно" : "Отключено"}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-red-700 hover:bg-red-50"
                  disabled={isSaving}
                  onClick={() => onRemove(word.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <AdminMutedText>Стоп-слов пока нет.</AdminMutedText>
          )}
        </div>
      </div>
    </section>
  );
}
