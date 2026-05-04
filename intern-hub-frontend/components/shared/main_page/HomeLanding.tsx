"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Code2,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStacks } from "@/lib/hooks";

const prepSections = [
  {
    title: "Вопросы с собеседований",
    description: "Частые темы и формулировки вопросов по выбранному стеку.",
    icon: BookOpen,
    slug: "questions",
  },
  {
    title: "Тестовые задания",
    description: "Практика на типовых задачах из реальных отборов.",
    icon: Code2,
    slug: "tasks",
  },
  {
    title: "Идеи для пет-проектов",
    description: "Идеи для портфолио-проектов с понятными целями роста.",
    icon: FolderKanban,
    slug: "",
  },
];

export function HomeLanding() {
  const { stacks, loading, error } = useStacks();
  const [activeStackId, setActiveStackId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStackId && stacks.length > 0) {
      setActiveStackId(stacks[0].id);
    }
  }, [activeStackId, stacks]);

  const activeStack = useMemo(
    () => stacks.find((stack) => stack.id === activeStackId) ?? stacks[0],
    [activeStackId, stacks],
  );

  const activeId = activeStack?.id ?? "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f0e8] text-[#171717]">
      <div className="pointer-events-none absolute -left-28 -top-32 h-96 w-96 rounded-full bg-[#d8e9d7] blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-[22rem] w-[22rem] rounded-full bg-[#f2d6b3] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[20rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#dbe3f5] blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.2rem] border border-[#161616]/10 bg-[#faf8f2]/90 p-6 shadow-[0_20px_80px_rgba(30,30,30,0.08)] sm:p-8 lg:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#161616]/15 bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f5f4a]">
              <Sparkles className="h-3.5 w-3.5" />
              Навигация по стеку
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Выберите направление.
              <span className="block text-[#3f5f4a]">Двигайтесь быстрее.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#505050] sm:text-lg">
              Выберите стек технологий и сразу переходите либо к вакансиям, либо
              к материалам для подготовки.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                disabled={!activeId}
                className="h-12 rounded-xl bg-[#171717] px-6 text-[15px] text-white hover:bg-black"
              >
                <Link href={activeId ? `/${activeId}/jobs` : "#"}>
                  Смотреть вакансии
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                disabled={!activeId}
                variant="outline"
                className="h-12 rounded-xl border-[#171717]/20 bg-white/70 px-6 text-[15px] hover:bg-white"
              >
                <Link href={activeId ? `/directions/${activeId}` : "#"}>
                  Открыть раздел подготовки
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#161616]/10 bg-[#171717] p-6 text-white shadow-[0_20px_80px_rgba(30,30,30,0.18)] sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">
              Выбранный стек
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight">
              {activeStack?.name ?? "Загрузка"}
            </h2>

            <div className="mt-6 grid gap-4">
              <Link
                href={activeId ? `/${activeId}/jobs` : "#"}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Вакансии по стеку</p>
                    <p className="text-sm text-white/70">
                      Актуальные роли и подробные карточки вакансий.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href={activeId ? `/directions/${activeId}` : "#"}
                className="rounded-2xl border border-white/15 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/10 p-2.5">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Хаб подготовки</p>
                    <p className="text-sm text-white/70">
                      Вопросы, задания и идеи проектов.
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-gradient-to-r from-[#4e6d59] to-[#6a8d77] p-4">
              <p className="text-sm">
                {loading
                  ? "Загружаем список стеков..."
                  : `Доступно стеков: ${stacks.length}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-[2rem] border border-[#161616]/10 bg-white/70 p-5 backdrop-blur sm:p-6 lg:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3f5f4a]">
                Выбор стека
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                Технологии
              </h3>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              Не удалось загрузить список стеков. Обновите страницу.
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl border border-[#161616]/10 bg-[#efeee8]"
                  />
                ))
              : stacks.map((stack) => {
                  const isActive = stack.id === activeStack?.id;

                  return (
                    <button
                      key={stack.id}
                      type="button"
                      onClick={() => setActiveStackId(stack.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-[#171717] bg-[#171717] text-white shadow-lg"
                          : "border-[#161616]/15 bg-white/80 hover:-translate-y-0.5 hover:border-[#3f5f4a] hover:bg-white"
                      }`}
                    >
                      <p
                        className={`text-xs uppercase tracking-[0.16em] ${
                          isActive ? "text-white/70" : "text-[#6f6f6f]"
                        }`}
                      >
                        Стек
                      </p>
                      <p className="mt-3 text-xl font-semibold">{stack.name}</p>
                      <p
                        className={`mt-4 text-sm ${
                          isActive ? "text-white/80" : "text-[#4f4f4f]"
                        }`}
                      >
                        {isActive ? "Выбран" : "Нажмите, чтобы выбрать"}
                      </p>
                    </button>
                  );
                })}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-[2rem] border border-[#161616]/10 bg-[#faf8f2]/90 p-6 shadow-[0_16px_60px_rgba(20,20,20,0.08)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3f5f4a]">
                Материалы для подготовки
              </p>
              <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight sm:text-3xl">
                Прокачка навыков для {activeStack?.name ?? "вашего стека"}
              </h3>
            </div>

            <Button
              asChild
              disabled={!activeId}
              className="h-11 rounded-xl bg-[#3f5f4a] px-5 text-white hover:bg-[#314c3b]"
            >
              <Link href={activeId ? `/directions/${activeId}` : "#"}>
                Смотреть всё
              </Link>
            </Button>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {prepSections.map((item) => {
              const Icon = item.icon;
              const href = item.slug
                ? `/directions/${activeId}/${item.slug}`
                : `/directions/${activeId}`;

              return (
                <Link
                  key={item.title}
                  href={activeId ? href : "#"}
                  className="group rounded-2xl border border-[#161616]/10 bg-white/85 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="inline-flex rounded-xl bg-[#ecf2e8] p-2.5 text-[#3f5f4a]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#565656]">
                    {item.description}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#3f5f4a]">
                    Перейти
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
