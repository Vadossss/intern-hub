"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { VacanciesSection } from "@/components/shared/VacanciesSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStacks, useVacancies } from "@/lib/hooks";

function JobsContent() {
  const params = useParams();
  const stackId = params.stack as string;
  const { stacks } = useStacks();

  const currentStack = stacks.find((stack) => stack.id === stackId);
  const { content } = useVacancies(
    stackId !== "all" ? { position: stackId.toUpperCase() } : undefined,
  );

  if (content.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f1e9]">
        <div className="text-center">
          <p className="text-lg text-[#5e5e5e]">Загрузка вакансий...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1e9]">
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#d8e7d6] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-[#f0d6b8] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[20rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#dbe3f5] blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-4 pb-1 pt-10 sm:px-6 lg:px-8">
        <Link href="/">
          <Button
            variant="ghost"
            className="mb-6 rounded-xl text-[#444] hover:bg-white/60"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад на главную
          </Button>
        </Link>

        {/* <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-[#161616]/10 bg-[#faf8f2]/90 p-6 shadow-[0_18px_70px_rgba(20,20,20,0.08)] sm:p-8">
            <Badge className="rounded-full border border-[#161616]/15 bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.12em] text-[#3f5f4a] hover:bg-white/70">
              <Sparkles className="mr-2 h-4 w-4" />
              Каталог вакансий
            </Badge>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-[#171717] sm:text-5xl">
              Вакансии{currentStack ? ` — ${currentStack.name}` : ""}
            </h1>
          </div>

          <div className="rounded-[2rem] border border-[#161616]/10 bg-[#171717] p-6 text-white shadow-[0_20px_80px_rgba(30,30,30,0.18)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
              Текущий стек
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight">
              {currentStack?.name ?? "Все направления"}
            </h2>
          </div>
        </div> */}
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8 lg:pb-20">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-[1.75rem] border border-[#161616]/10 bg-white/75 p-5 shadow-[0_14px_40px_rgba(20,20,20,0.08)] backdrop-blur">
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[#171717]">
                <Filter className="h-4 w-4 text-[#5d5d5d]" />
                <p className="font-semibold">Фильтры</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#444]">
                  Поиск
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                  <Input
                    placeholder="Например, Frontend Developer"
                    className="rounded-xl border-[#161616]/15 bg-white pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#444]">
                  Город
                </label>
                <select className="h-10 w-full rounded-xl border border-[#161616]/15 bg-white px-3 text-sm text-[#171717]">
                  <option>Любой город</option>
                  <option>Москва</option>
                  <option>Санкт-Петербург</option>
                  <option>Удаленно</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#444]">
                  Зарплата
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="От"
                    className="rounded-xl border-[#161616]/15 bg-white"
                  />
                  <Input
                    placeholder="До"
                    className="rounded-xl border-[#161616]/15 bg-white"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#444]">
                  Формат работы
                </p>
                <div className="space-y-2 text-sm text-[#444]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    Удаленно
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    Офис
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    Гибрид
                  </label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#444]">Опыт</p>
                <div className="space-y-2 text-sm text-[#444]">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    Без опыта
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    1-3 года
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 rounded" />
                    3-6 лет
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button className="rounded-xl bg-[#171717] text-white hover:bg-black">
                  Применить
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-[#161616]/20 bg-white hover:bg-[#f7f7f7]"
                >
                  Сбросить
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {/* <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#161616]/10 bg-white/75 p-3 shadow-sm backdrop-blur">
            <Badge
              variant="secondary"
              className="rounded-full bg-[#edf3ea] text-[#3f5f4a]"
            >
              Frontend
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-[#edf3ea] text-[#3f5f4a]"
            >
              Remote
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-[#edf3ea] text-[#3f5f4a]"
            >
              Full-time
            </Badge>
          </div> */}

          <VacanciesSection
            vacancies={content}
            selectedDirection={null}
            title={currentStack ? `${currentStack.name}: вакансии` : "Вакансии"}
            description="Карточки показывают ключевые условия, формат работы и навыки, чтобы быстрее выбирать подходящие роли."
          />
        </section>
      </section>
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f1e9]">
          <div className="text-center">
            <p className="text-lg text-[#5e5e5e]">Загрузка...</p>
          </div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
