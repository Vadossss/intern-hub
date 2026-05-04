"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TECH_CATEGORIES = [
  {
    slug: "java",
    label: "Java",
    icon: "☕",
    count: 3142,
    color: "#E76F00",
    bg: "#FEF0E0",
  },
  {
    slug: "python",
    label: "Python",
    icon: "🐍",
    count: 2847,
    color: "#3776AB",
    bg: "#E8F1FA",
  },
  {
    slug: "frontend",
    label: "Frontend",
    icon: "⚡",
    count: 2401,
    color: "#F7DF1E",
    bg: "#FEFBE8",
    iconColor: "#0D0D0F",
  },
  {
    slug: "devops",
    label: "DevOps",
    icon: "🐳",
    count: 1654,
    color: "#0DB7ED",
    bg: "#E0F5FD",
  },
  {
    slug: "golang",
    label: "Go",
    icon: "🔵",
    count: 987,
    color: "#00ADD8",
    bg: "#E0F7FD",
  },
  {
    slug: "data",
    label: "Data",
    icon: "📊",
    count: 1203,
    color: "#FF6B35",
    bg: "#FEEDE6",
  },
  {
    slug: "mobile",
    label: "Mobile",
    icon: "📱",
    count: 876,
    color: "#5856D6",
    bg: "#EEEEF9",
  },
  {
    slug: "csharp",
    label: "C# / .NET",
    icon: "🔷",
    count: 1124,
    color: "#512BD4",
    bg: "#EEEAFC",
  },
];

export default function CategoriesNav() {
  return (
    <section className="py-16 bg-white border-b border-[#E8E3DA]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#A09890] mb-3">
              По технологиям
            </div>
            <h2
              className="text-3xl lg:text-4xl font-bold text-[#0D0D0F]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Найди вакансию по стеку
            </h2>
          </div>
          <Link
            href="/vacancies"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#6B6B7A] hover:text-[#0D0D0F] transition-colors group"
          >
            Все категории
            <ArrowRight
              size={15}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar lg:grid lg:grid-cols-8 lg:pb-0">
          {TECH_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/vacancies?tech=${cat.slug}`}
              className="group flex-shrink-0 w-32 lg:w-auto flex flex-col items-center text-center p-5 rounded-2xl border border-[#E8E3DA] hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: cat.bg }}
              >
                {cat.icon}
              </div>

              <div className="text-sm font-bold text-[#0D0D0F] group-hover:text-[#1A7A5E] transition-colors mb-1">
                {cat.label}
              </div>
              <div
                className="text-xs font-mono font-medium"
                style={{ color: cat.color }}
              >
                {cat.count.toLocaleString("ru-RU")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
