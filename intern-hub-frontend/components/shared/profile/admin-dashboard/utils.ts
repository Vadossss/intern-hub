import type { VacancyExcludedWord } from "@/lib/api/admin";

export function byWord(left: VacancyExcludedWord, right: VacancyExcludedWord) {
  return left.word.localeCompare(right.word, "ru");
}

export function toLocalDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  return value.length === 16 ? `${value}:00` : value;
}
