"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { SkillsSelector } from "@/components/shared/SkillsSelector";
import {
  CandidateSearchCard,
  CandidatesEmptyState,
  CandidatesLoadingState,
  CandidatesPagination,
} from "@/components/shared/profile/EmployerCandidatesSectionParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SkillOption } from "@/lib/api/dictionaries";
import {
  type CandidateProfile,
  searchEmployerCandidates,
} from "@/lib/api/profile";

type OpenToWorkFilter = "all" | "true" | "false";

interface CandidateFilters {
  query: string;
  city: string;
  openToWork: OpenToWorkFilter;
  skillIds: number[];
}

const emptyFilters: CandidateFilters = {
  query: "",
  city: "",
  openToWork: "true",
  skillIds: [],
};

const pageSize = 10;

export function EmployerCandidatesSection({
  skillOptions,
  onOpenCandidate,
}: {
  skillOptions: SkillOption[];
  onOpenCandidate: (candidateId: number) => void;
}) {
  const [filters, setFilters] = useState<CandidateFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<CandidateFilters>(emptyFilters);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const selectedSkills = useMemo(
    () =>
      skillOptions.filter((skill) => filters.skillIds.includes(skill.id)),
    [filters.skillIds, skillOptions],
  );

  const loadCandidates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await searchEmployerCandidates({
        query: appliedFilters.query.trim() || undefined,
        city: appliedFilters.city.trim() || undefined,
        openToWork:
          appliedFilters.openToWork === "all"
            ? undefined
            : appliedFilters.openToWork === "true",
        skillIds: appliedFilters.skillIds,
        page,
        size: pageSize,
      });

      setCandidates(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Failed to search candidates:", error);
      toast.error("Не удалось найти соискателей. Проверьте сервер.");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setAppliedFilters({ ...filters });
  }

  function resetFilters() {
    setFilters(emptyFilters);
    setPage(0);
    setAppliedFilters(emptyFilters);
  }

  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Поиск соискателей</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[#626262]">
              Ищите кандидатов по имени, городу, описанию и навыкам.
            </p>
          </div>
          <Badge variant="outline" className="w-fit rounded-lg bg-[#f7f7f3]">
            {totalElements} найдено
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          className="space-y-4 rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-4"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_15rem_13rem]">
            <label className="block">
              <span className="text-sm font-semibold text-[#171717]">
                Поиск
              </span>
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
                <Input
                  value={filters.query}
                  placeholder="Имя, email, навык или текст профиля"
                  className="bg-white pl-9"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      query: event.target.value,
                    }))
                  }
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#171717]">
                Город
              </span>
              <Input
                value={filters.city}
                placeholder="Москва"
                className="mt-2 bg-white"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#171717]">
                Статус
              </span>
              <select
                value={filters.openToWork}
                className="mt-2 h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    openToWork: event.target.value as OpenToWorkFilter,
                  }))
                }
              >
                <option value="true">Открыты к предложениям</option>
                <option value="all">Все соискатели</option>
                <option value="false">Не ищут работу</option>
              </select>
            </label>
          </div>

          <SkillsSelector
            skills={skillOptions}
            selectedSkillIds={filters.skillIds}
            onChange={(skillIds) =>
              setFilters((current) => ({ ...current, skillIds }))
            }
            name="candidateSkillIds"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {selectedSkills.slice(0, 5).map((skill) => (
                <Badge
                  key={skill.id}
                  variant="outline"
                  className="rounded-lg bg-white"
                >
                  {skill.name}
                </Badge>
              ))}
              {selectedSkills.length > 5 ? (
                <Badge variant="outline" className="rounded-lg bg-white">
                  +{selectedSkills.length - 5}
                </Badge>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-white"
                onClick={resetFilters}
              >
                Сбросить
              </Button>
              <Button
                disabled={isLoading}
                className="rounded-xl bg-[#171717] text-white"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {isLoading ? "Ищем..." : "Найти"}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {isLoading ? (
            <CandidatesLoadingState />
          ) : candidates.length ? (
            candidates.map((candidate) => (
              <CandidateSearchCard
                key={candidate.userId}
                candidate={candidate}
                onOpenCandidate={onOpenCandidate}
              />
            ))
          ) : (
            <CandidatesEmptyState />
          )}
        </div>

        <CandidatesPagination
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
