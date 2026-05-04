"use client";

import Link from "next/link";
import {
  MessageSquare,
  ClipboardList,
  Lightbulb,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";

const PREP_CARDS = [
  {
    href: "/prep/questions",
    icon: MessageSquare,
    label: "Вопросы с собеседований",
    count: "1 200+",
    accent: "#1A7A5E",
    bg: "#E6F5F0",
    description:
      "Реальные вопросы с разбором ответов: от Junior до Principal. Сортировка по сложности, языку и теме.",
    samples: [
      "В чём разница между HashMap и ConcurrentHashMap?",
      "Как работает GC в JVM?",
      "Что такое CAP-теорема?",
    ],
  },
  {
    href: "/prep/tasks",
    icon: ClipboardList,
    label: "Тестовые задания",
    count: "98",
    accent: "#F5A623",
    bg: "#FEF6E4",
    description:
      "Практические задачи в формате реального найма — с описанием, временными рамками и примером решения.",
    samples: [
      "REST API для интернет-магазина — 4 часа",
      "Парсер JSON с валидацией — 2 часа",
      "Микросервис на Spring Boot — 1 день",
    ],
  },
  {
    href: "/prep/pet-projects",
    icon: Lightbulb,
    label: "Идеи для пет-проектов",
    count: "64",
    accent: "#2A2A32",
    bg: "#F0EFF5",
    description:
      "Конкретные идеи с описанием стека, ключевых фич и чему вы научитесь. Прокачай портфолио.",
    samples: [
      "Агрегатор вакансий на Spring + Next.js",
      "CLI-инструмент для анализа кода",
      "Real-time чат на WebSockets",
    ],
  },
];

const CATEGORIES = [
  {
    label: "Java Backend",
    count: 312,
    href: "/prep/questions?category=java-backend",
  },
  { label: "Frontend", count: 248, href: "/prep/questions?category=frontend" },
  { label: "DevOps", count: 187, href: "/prep/questions?category=devops" },
  {
    label: "Базы данных",
    count: 204,
    href: "/prep/questions?category=databases",
  },
  {
    label: "Алгоритмы",
    count: 156,
    href: "/prep/questions?category=algorithms",
  },
  {
    label: "System Design",
    count: 93,
    href: "/prep/questions?category=system-design",
  },
];

export default function PrepSection() {
  return (
    <section className="py-20 bg-[#EDE9E1] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C5BFB5, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, #C5BFB5, transparent)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#A09890] mb-3">
              Для карьерного роста
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold text-[#0D0D0F] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Подготовка
              <br />
              <span className="italic text-[#1A7A5E]">к собеседованию</span>
            </h2>
          </div>
          <p className="text-[#6B6B7A] max-w-xs leading-relaxed text-sm sm:text-base">
            Всё необходимое для успешного прохождения технического интервью — в
            одном месте.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {PREP_CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative bg-white rounded-2xl p-7 border border-[#E8E3DA] hover:border-transparent hover:shadow-2xl transition-all duration-400 overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{ background: card.accent }}
                />

                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: card.bg }}
                  >
                    <Icon size={22} style={{ color: card.accent }} />
                  </div>
                  <span
                    className="text-3xl font-bold tabular-nums"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: card.accent,
                    }}
                  >
                    {card.count}
                  </span>
                </div>

                <h3
                  className="text-xl font-bold text-[#0D0D0F] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {card.label}
                </h3>
                <p className="text-sm text-[#6B6B7A] leading-relaxed mb-6">
                  {card.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {card.samples.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 text-xs text-[#2A2A32]"
                    >
                      <ChevronRight
                        size={14}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: card.accent }}
                      />
                      {s}
                    </li>
                  ))}
                </ul>

                <div
                  className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200"
                  style={{ color: card.accent }}
                >
                  Смотреть все
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1.5 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#E8E3DA]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h3 className="text-base font-bold text-[#0D0D0F]">
              Вопросы по категориям
            </h3>
            <Link
              href="/prep/questions"
              className="text-sm font-semibold text-[#1A7A5E] hover:underline flex items-center gap-1"
            >
              Все категории <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[#F7F5F0] hover:bg-[#0D0D0F] transition-all duration-250 border border-transparent hover:border-[#0D0D0F]"
              >
                <span className="text-xs font-bold text-[#2A2A32] group-hover:text-[#F7F5F0] transition-colors leading-snug mb-1.5">
                  {cat.label}
                </span>
                <span className="text-xs text-[#A09890] group-hover:text-[#F5A623] transition-colors font-mono">
                  {cat.count} вопр.
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
