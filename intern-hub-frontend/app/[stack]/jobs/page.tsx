"use client";

import { Suspense, useEffect, useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronsUpDown,
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import type { VacancyResponseDto } from "@/app/types/api";
import type { Direction } from "@/components/shared/DirectionSelector";
import { VacanciesSection } from "@/components/shared/VacanciesSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVacancyDictionaries,
  getVacancyFilterOptions,
  type DictionaryItem,
  type VacancyDictionaries,
  type VacancyFilterOptions,
} from "@/lib/api/dictionaries";
import { getVacancies, type GetVacanciesParams } from "@/lib/api/vacancies";

const directionNames: Record<Direction, string> = {
  java: "Java",
  javascript: "JavaScript",
  python: "Python",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  kotlin: "Kotlin",
};

const stackToPosition: Record<string, string> = {
  java: "JAVA",
  javascript: "JAVASCRIPT",
  python: "PYTHON",
  csharp: "CSHARP",
  datascience: "DATASCIENCE",
  go: "GO",
  qa: "QA",
  design: "DESIGN",
};

const emptyDictionaries: VacancyDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  stacks: [],
  skills: [],
};

const emptyFilterOptions: VacancyFilterOptions = {
  cities: [],
  companies: [],
  sources: [],
};

function JobsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stackId = String(params.stack ?? "all");
  const route = `/${stackId}/jobs`;
  const routePosition = stackToPosition[stackId] ?? "";
  const routeDirection = getRouteDirection(stackId);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const [vacancies, setVacancies] = useState<VacancyResponseDto[]>([]);
  const [dictionaries, setDictionaries] =
    useState<VacancyDictionaries>(emptyDictionaries);
  const [filterOptions, setFilterOptions] =
    useState<VacancyFilterOptions>(emptyFilterOptions);
  const [vacanciesLoading, setVacanciesLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadFilters() {
      try {
        setFiltersLoading(true);
        const [nextDictionaries, nextFilterOptions] = await Promise.all([
          getVacancyDictionaries(),
          getVacancyFilterOptions(),
        ]);

        if (!isMounted) return;
        setDictionaries(nextDictionaries);
        setFilterOptions(nextFilterOptions);
      } catch (error) {
        console.error("Failed to load vacancy filters:", error);
        if (isMounted) {
          toast.error("Не удалось загрузить фильтры вакансий.");
        }
      } finally {
        if (isMounted) setFiltersLoading(false);
      }
    }

    loadFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadVacancies() {
      try {
        setVacanciesLoading(true);
        const response = await getVacancies(
          toApiParams(filters, routePosition),
        );

        if (!isMounted) return;

        setVacancies(response.content);
        setPageInfo({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          first: response.first,
          last: response.last,
        });
      } catch (error) {
        console.error("Failed to load vacancies:", error);
        if (isMounted) {
          toast.error("Не удалось загрузить вакансии.");
          setVacancies([]);
          setPageInfo((current) => ({
            ...current,
            pageNumber: 0,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true,
          }));
        }
      } finally {
        if (isMounted) setVacanciesLoading(false);
      }
    }

    loadVacancies();

    return () => {
      isMounted = false;
    };
  }, [filters, routePosition]);

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextParams = new URLSearchParams();

    setIfPresent(nextParams, "searchText", formData.get("searchText"));
    setIfPresent(nextParams, "companyName", formData.get("companyName"));
    setIfPresent(nextParams, "city", formData.get("city"));
    setIfPresent(nextParams, "salaryMin", formData.get("salaryMin"));
    setIfPresent(nextParams, "salaryMax", formData.get("salaryMax"));
    setIfPresent(nextParams, "sortBy", formData.get("sortBy"));
    setIfPresent(nextParams, "sortDirection", formData.get("sortDirection"));

    if (!routePosition) {
      setIfPresent(nextParams, "position", formData.get("position"));
    }

    for (const key of ["source", "workFormats", "employment", "experience"]) {
      formData
        .getAll(key)
        .forEach((value) => setIfPresent(nextParams, key, value));
    }

    nextParams.set("page", "0");
    nextParams.set("size", String(filters.size));
    router.push(`${route}?${nextParams.toString()}`);
  }

  function resetFilters() {
    router.push(route);
  }

  function goToPage(page: number) {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(Math.max(0, page)));
    nextParams.set("size", String(filters.size));
    router.push(`${route}?${nextParams.toString()}`);
  }

  const currentStack = dictionaries.stacks.find(
    (stack) => stack.id === stackId,
  );
  const title = currentStack
    ? `${currentStack.name}: вакансии`
    : stackId === "all"
      ? "Все вакансии"
      : `${directionNames[routeDirection as Direction] ?? stackId}: вакансии`;
  const showPageSkeleton = filtersLoading || vacanciesLoading;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1e9]">
      <section className="relative mx-auto max-w-7xl px-4 pb-1 pt-10 sm:px-6 lg:px-8">
        <Button
          asChild
          variant="ghost"
          className="mb-6 rounded-xl text-[#444] hover:bg-white/60"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад на главную
          </Link>
        </Button>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8 lg:pb-20">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/75 p-5 shadow-[0_14px_40px_rgba(20,20,20,0.08)] backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[#171717]">
                <Filter className="h-4 w-4 text-[#5d5d5d]" />
                <p className="font-semibold">Фильтры</p>
              </div>
              <SlidersHorizontal className="h-4 w-4 text-[#777]" />
            </div>

            {filtersLoading ? (
              <FiltersSkeleton />
            ) : (
              <form onSubmit={applyFilters} className="space-y-5">
                <label className="block text-sm font-medium text-[#444]">
                  Поиск
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
                    <Input
                      name="searchText"
                      defaultValue={filters.searchText}
                      placeholder="Например, Frontend Developer"
                      className="rounded-xl border-[#161616]/15 bg-white pl-9"
                    />
                  </div>
                </label>

                {!routePosition ? (
                  <SearchableFilterSelect
                    label="Направление"
                    name="position"
                    value={filters.position}
                    options={positionOptions(dictionaries.stacks)}
                  />
                ) : null}

                <SearchableFilterSelect
                  label="Компания"
                  name="companyName"
                  value={filters.companyName}
                  options={stringOptions(filterOptions.companies)}
                />

                <SearchableFilterSelect
                  label="Город"
                  name="city"
                  value={filters.city}
                  options={stringOptions(filterOptions.cities)}
                />

                <div>
                  <p className="mb-2 text-sm font-medium text-[#444]">
                    Зарплата
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="salaryMin"
                      type="number"
                      min={0}
                      defaultValue={filters.salaryMin}
                      placeholder="От"
                      className="rounded-xl border-[#161616]/15 bg-white"
                    />
                    <Input
                      name="salaryMax"
                      type="number"
                      min={0}
                      defaultValue={filters.salaryMax}
                      placeholder="До"
                      className="rounded-xl border-[#161616]/15 bg-white"
                    />
                  </div>
                </div>

                <CheckboxGroup
                  title="Источник"
                  name="source"
                  values={filters.source}
                  options={filterOptions.sources}
                />
                <CheckboxGroup
                  title="Формат работы"
                  name="workFormats"
                  values={filters.workFormats}
                  options={dictionaries.workFormats}
                />
                <CheckboxGroup
                  title="Занятость"
                  name="employment"
                  values={filters.employment}
                  options={dictionaries.employments}
                />
                <CheckboxGroup
                  title="Опыт"
                  name="experience"
                  values={filters.experience}
                  options={dictionaries.experiences}
                />

                <div className="grid grid-cols-2 gap-2">
                  <SearchableFilterSelect
                    label="Сортировать"
                    name="sortBy"
                    value={filters.sortBy}
                    options={[
                      { id: "title", name: "Название" },
                      { id: "salaryFrom", name: "Зарплата" },
                      { id: "city", name: "Город" },
                      { id: "createdAt", name: "Дата" },
                    ]}
                  />
                  <SearchableFilterSelect
                    label="Порядок"
                    name="sortDirection"
                    value={filters.sortDirection}
                    options={[
                      { id: "asc", name: "По возрастанию" },
                      { id: "desc", name: "По убыванию" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button className="rounded-xl bg-[#171717] text-white hover:bg-black">
                    Применить
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-[#161616]/20 bg-white hover:bg-[#f7f7f7]"
                    onClick={resetFilters}
                  >
                    Сбросить
                  </Button>
                </div>
              </form>
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          {showPageSkeleton ? (
            <VacanciesSkeleton />
          ) : (
            <VacanciesSection
              vacancies={vacancies}
              selectedDirection={routeDirection}
              title={title}
              description={`Найдено вакансий: ${pageInfo.totalElements}`}
            />
          )}

          {!showPageSkeleton ? (
            <Pagination
              pageNumber={pageInfo.pageNumber}
              totalPages={pageInfo.totalPages}
              first={pageInfo.first}
              last={pageInfo.last}
              onPageChange={goToPage}
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f1e9] px-4 py-10">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <FiltersSkeleton />
            <VacanciesSkeleton />
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}

interface VacancyFilters {
  source: string[];
  position: string;
  companyName: string;
  city: string;
  salaryMin: string;
  salaryMax: string;
  searchText: string;
  workFormats: string[];
  employment: string[];
  experience: string[];
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

interface SearchParamsLike {
  get(name: string): string | null;
  getAll(name: string): string[];
}

function readFilters(searchParams: SearchParamsLike): VacancyFilters {
  return {
    source: searchParams.getAll("source"),
    position: searchParams.get("position") ?? "",
    companyName: searchParams.get("companyName") ?? "",
    city: searchParams.get("city") ?? "",
    salaryMin: searchParams.get("salaryMin") ?? "",
    salaryMax: searchParams.get("salaryMax") ?? "",
    searchText: searchParams.get("searchText") ?? "",
    workFormats: searchParams.getAll("workFormats"),
    employment: searchParams.getAll("employment"),
    experience: searchParams.getAll("experience"),
    page: numberParam(searchParams.get("page"), 0),
    size: positiveNumberParam(searchParams.get("size"), 12),
    sortBy: searchParams.get("sortBy") ?? "title",
    sortDirection: searchParams.get("sortDirection") ?? "asc",
  };
}

function toApiParams(
  filters: VacancyFilters,
  routePosition: string,
): GetVacanciesParams {
  return {
    source: filters.source.length ? filters.source : undefined,
    position: routePosition || filters.position || undefined,
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

function getRouteDirection(stackId: string): Direction | null {
  return stackId in directionNames ? (stackId as Direction) : null;
}

function positionOptions(stacks: DictionaryItem[]): DictionaryItem[] {
  return stacks.reduce<DictionaryItem[]>((options, stack) => {
    const position = stackToPosition[stack.id];

    if (position) {
      options.push({ id: position, name: stack.name });
    }

    return options;
  }, []);
}

function stringOptions(values: string[]): DictionaryItem[] {
  return values.map((value) => ({ id: value, name: value }));
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

function setIfPresent(
  params: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null,
) {
  const text = value ? String(value).trim() : "";
  if (text) params.append(key, text);
}

function SearchableFilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: DictionaryItem[];
}) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const selectedOption = options.find((option) => option.id === selectedValue);
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function selectValue(nextValue: string) {
    setSelectedValue(nextValue);
    setQuery("");
    setOpen(false);
  }

  return (
    <div
      className="relative grid min-w-0 gap-1 text-sm font-medium text-[#444]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <label htmlFor={inputId}>{label}</label>
      <input type="hidden" name={name} value={selectedValue} />
      <button
        id={inputId}
        type="button"
        aria-expanded={open}
        className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#161616]/15 bg-white px-3 text-left text-sm text-[#171717] shadow-sm outline-none transition hover:border-[#161616]/30 focus:border-[#48644d] focus:ring-2 focus:ring-[#48644d]/15"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.name ?? "Все"}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#777]" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-[#161616]/15 bg-white shadow-[0_18px_45px_rgba(20,20,20,0.16)]">
          <div className="border-b border-[#161616]/10 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <input
                autoFocus
                value={query}
                placeholder="Поиск"
                className="h-9 w-full rounded-lg border border-[#161616]/12 bg-[#f8f7f2] pl-9 pr-3 text-sm font-normal text-[#171717] outline-none focus:border-[#48644d] focus:ring-2 focus:ring-[#48644d]/15"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                  }
                }}
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto p-1">
            <button
              type="button"
              className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-normal text-[#171717] hover:bg-[#f3f0e8]"
              onClick={() => selectValue("")}
            >
              <Check
                className={
                  selectedValue ? "h-4 w-4 opacity-0" : "h-4 w-4 text-[#48644d]"
                }
              />
              <span className="min-w-0 truncate">Все</span>
            </button>

            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-normal text-[#171717] hover:bg-[#f3f0e8]"
                  onClick={() => selectValue(option.id)}
                >
                  <Check
                    className={
                      option.id === selectedValue
                        ? "h-4 w-4 shrink-0 text-[#48644d]"
                        : "h-4 w-4 shrink-0 opacity-0"
                    }
                  />
                  <span className="min-w-0 truncate">{option.name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-center text-sm font-normal text-[#777]">
                Ничего не найдено
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  name,
  value,
  options,
}: {
  label: string;
  name: string;
  value: string;
  options: DictionaryItem[];
}) {
  return (
    <label className="grid min-w-0 gap-1 text-sm font-medium text-[#444]">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="h-10 w-full min-w-0 truncate rounded-xl border border-[#161616]/15 bg-white px-3 text-sm text-[#171717]"
      >
        <option value="">Все</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({
  title,
  name,
  values,
  options,
}: {
  title: string;
  name: string;
  values: string[];
  options: DictionaryItem[];
}) {
  if (!options.length) return null;

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-[#444]">{title}</legend>
      <div className="grid gap-2 text-sm text-[#444]">
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={values.includes(option.id)}
              className="h-4 w-4 rounded border-[#161616]/20"
            />
            {option.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-[#161616]/10" />
          <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
        <div className="h-10 animate-pulse rounded-xl bg-[#161616]/10" />
      </div>
    </div>
  );
}

function VacanciesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/75 p-6 shadow-sm">
        <div className="h-8 w-2/5 animate-pulse rounded bg-[#161616]/10" />
        <div className="mt-3 h-4 w-1/4 animate-pulse rounded bg-[#161616]/10" />
      </div>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-[1.25rem] border border-[#161616]/10 bg-white/75 p-5 shadow-sm"
        >
          <div className="h-6 w-3/5 animate-pulse rounded bg-[#161616]/10" />
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
            <div className="h-4 animate-pulse rounded bg-[#161616]/10" />
          </div>
          <div className="mt-5 h-16 animate-pulse rounded-xl bg-[#161616]/10" />
        </div>
      ))}
    </div>
  );
}

function Pagination({
  pageNumber,
  totalPages,
  first,
  last,
  onPageChange,
}: {
  pageNumber: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (page) =>
      Math.abs(page - pageNumber) <= 2 || page === 0 || page === totalPages - 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#161616]/10 bg-white/75 p-3 shadow-sm">
      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        disabled={first}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const needsGap = previous !== undefined && page - previous > 1;

        return (
          <span key={page} className="inline-flex items-center gap-2">
            {needsGap ? <span className="text-[#777]">...</span> : null}
            <Button
              type="button"
              variant={page === pageNumber ? "default" : "outline"}
              className={
                page === pageNumber
                  ? "rounded-xl bg-[#171717] text-white"
                  : "rounded-xl"
              }
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </Button>
          </span>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="rounded-xl"
        disabled={last}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Далее
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
