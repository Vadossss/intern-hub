"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  EmployerCard,
  EmployersGridSkeleton,
  EmployersPageSkeleton,
  EmptyState,
  Pagination,
} from "@/components/shared/employer/EmployersListPageParts";
import {
  getEmployerKey,
  numberParam,
} from "@/components/shared/employer/EmployersListPage.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getEmployers,
  type PublicEmployerProfile,
} from "@/lib/api/employers";

const PAGE_SIZE = 12;

export function EmployersListPage() {
  return (
    <Suspense fallback={<EmployersPageSkeleton />}>
      <EmployersContent />
    </Suspense>
  );
}

function EmployersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => ({
      query: searchParams.get("query") ?? "",
      page: numberParam(searchParams.get("page"), 0),
    }),
    [searchParams],
  );

  const [searchValue, setSearchValue] = useState(filters.query);
  const [employers, setEmployers] = useState<PublicEmployerProfile[]>([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSearchValue(filters.query);
  }, [filters.query]);

  useEffect(() => {
    let active = true;

    async function loadEmployers() {
      try {
        setLoading(true);
        setError(null);

        const response = await getEmployers({
          query: filters.query || undefined,
          page: filters.page,
          size: PAGE_SIZE,
        });

        if (!active) {
          return;
        }

        setEmployers(response.content);
        setPageInfo({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          first: response.first,
          last: response.last,
        });
      } catch (loadError) {
        console.error("Failed to load employers:", loadError);

        if (!active) {
          return;
        }

        setEmployers([]);
        setError("Не удалось загрузить компании.");
        toast.error("Не удалось загрузить компании.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEmployers();

    return () => {
      active = false;
    };
  }, [filters]);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const query = searchValue.trim();

    if (query) {
      params.set("query", query);
      params.set("page", "0");
      router.push(`/employers?${params.toString()}`);
      return;
    }

    router.push("/employers");
  }

  function resetSearch() {
    setSearchValue("");
    router.push("/employers");
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(0, page)));
    router.push(`/employers?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="rounded-xl text-[#4a4a4a] hover:bg-white/70"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            На главную
          </Link>
        </Button>

        <section className="rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
                Работодатели
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#111] sm:text-4xl">
                Компании на Intern Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#606060]">
                Каталог работодателей с публичными профилями и активными вакансиями.
              </p>
            </div>

            <Badge
              variant="outline"
              className="w-fit rounded-full border-[#161616]/15 bg-[#f7f7f4] px-4 py-2 text-sm font-semibold text-[#555]"
            >
              {pageInfo.totalElements} компаний
            </Badge>
          </div>

          <form
            onSubmit={applySearch}
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="h-12 rounded-xl border-[#161616]/10 bg-white pl-11 text-sm font-medium"
                placeholder="Название, город или описание компании"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button className="h-12 rounded-xl bg-[#171717] px-5 text-white">
                Найти
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl bg-white px-5"
                onClick={resetSearch}
              >
                Сбросить
              </Button>
            </div>
          </form>
        </section>

        {loading ? (
          <EmployersGridSkeleton />
        ) : error ? (
          <EmptyState title="Компании недоступны" description={error} />
        ) : employers.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {employers.map((employer) => (
              <EmployerCard key={getEmployerKey(employer)} employer={employer} />
            ))}
          </section>
        ) : (
          <EmptyState
            title="Компании не найдены"
            description="Попробуйте изменить поисковый запрос или открыть полный список."
          />
        )}

        <Pagination
          pageNumber={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          first={pageInfo.first}
          last={pageInfo.last}
          onPageChange={goToPage}
        />
      </div>
    </main>
  );
}
