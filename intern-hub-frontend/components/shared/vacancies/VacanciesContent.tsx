"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Filter, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import type { VacancyResponseDto } from "@/app/types/api";
import { VacanciesSection } from "@/components/shared/VacanciesSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getVacancyDictionaries,
  getVacancyFilterOptions,
  type VacancyDictionaries,
  type VacancyFilterOptions,
} from "@/lib/api/dictionaries";
import { getVacancies } from "@/lib/api/vacancies";

import { CheckboxGroup } from "./CheckboxGroup";
import { emptyDictionaries, emptyFilterOptions } from "./vacanciesConstants";
import { FiltersSkeleton } from "./FiltersSkeleton";
import { Pagination } from "./Pagination";
import { SearchableFilterSelect } from "./SearchableFilterSelect";
import { SearchableMultiFilterSelect } from "./SearchableMultiFilterSelect";
import { StickyFilterSidebar } from "./StickyFilterSidebar";
import { VacanciesSkeleton } from "./VacanciesSkeleton";
import {
  readFilters,
  setIfPresent,
  stringOptions,
  toApiParams,
} from "./vacanciesFilters";

export function VacanciesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const route = "/vacancies";
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
        const response = await getVacancies(toApiParams(filters));

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
  }, [filters]);

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

    for (const key of [
      "direction",
      "source",
      "workFormats",
      "employment",
      "experience",
    ]) {
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

  const selectedDirectionNames = filterOptions.directions
    .filter((direction) => filters.direction.includes(direction.id))
    .map((direction) => direction.name);
  const title = selectedDirectionNames.length
    ? `${selectedDirectionNames.join(", ")}: вакансии`
    : "Все вакансии";
  const showPageSkeleton = filtersLoading || vacanciesLoading;

  return (
    <main className="relative min-h-screen bg-[#f4f1e9]">
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
        <StickyFilterSidebar>
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

                <SearchableMultiFilterSelect
                  label="Направления"
                  name="direction"
                  values={filters.direction}
                  options={filterOptions.directions}
                />

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
        </StickyFilterSidebar>

        <section className="min-w-0 space-y-4">
          {showPageSkeleton ? (
            <VacanciesSkeleton />
          ) : (
            <VacanciesSection
              vacancies={vacancies}
              selectedDirection={null}
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
