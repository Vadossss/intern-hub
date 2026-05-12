import type { DictionaryItem } from "@/lib/api/dictionaries";
import type { GetVacanciesParams } from "@/lib/api/vacancies";

import type { SearchParamsLike, VacancyFilters } from "./vacanciesTypes";

export function readFilters(searchParams: SearchParamsLike): VacancyFilters {
  return {
    source: searchParams.getAll("source"),
    direction: searchParams.getAll("direction"),
    companyName: searchParams.get("companyName") ?? "",
    city: searchParams.get("city") ?? "",
    salaryMin: searchParams.get("salaryMin") ?? "",
    salaryMax: searchParams.get("salaryMax") ?? "",
    searchText: searchParams.get("searchText") ?? "",
    workFormats: searchParams.getAll("workFormats"),
    employment: searchParams.getAll("employment"),
    experience: searchParams.getAll("experience"),
    page: numberParam(searchParams.get("page"), 0),
    size: positiveNumberParam(searchParams.get("size"), 20),
    sortBy: searchParams.get("sortBy") ?? "title",
    sortDirection: searchParams.get("sortDirection") ?? "asc",
  };
}

export function toApiParams(filters: VacancyFilters): GetVacanciesParams {
  return {
    source: filters.source.length ? filters.source : undefined,
    direction: filters.direction.length ? filters.direction : undefined,
    companyName: filters.companyName || undefined,
    city: filters.city || undefined,
    salaryMin: numberOrUndefined(filters.salaryMin),
    salaryMax: numberOrUndefined(filters.salaryMax),
    searchText: filters.searchText || undefined,
    workFormats: filters.workFormats.length ? filters.workFormats : undefined,
    employment: filters.employment.length ? filters.employment : undefined,
    experience: filters.experience.length ? filters.experience : undefined,
    page: filters.page,
    size: filters.size,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  };
}

export function stringOptions(values: string[]): DictionaryItem[] {
  return values.map((value) => ({ id: value, name: value }));
}

export function setIfPresent(
  params: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null,
) {
  const text = value ? String(value).trim() : "";
  if (text) params.append(key, text);
}

function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function positiveNumberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
