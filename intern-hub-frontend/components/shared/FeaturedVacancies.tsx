"use client";

import Link from "next/link";
import { MapPin, Clock, ArrowRight, Star, Zap, TrendingUp } from "lucide-react";
import clsx from "clsx";

const VACANCIES = [
  {
    id: 1,
    title: "Senior Java Developer",
    company: "Яндекс",
    companyInitial: "Я",
    companyColor: "#FF0000",
    location: "Москва / Удалённо",
    salary: "280 000 — 400 000 ₽",
    tags: ["Java", "Spring Boot", "Kafka", "K8s"],
    source: "HH",
    posted: "2 часа назад",
    hot: true,
    featured: false,
  },
  {
    id: 2,
    title: "Frontend Engineer (React)",
    company: "Т-Банк",
    companyInitial: "Т",
    companyColor: "#FFDD2D",
    companyTextColor: "#000",
    location: "Удалённо",
    salary: "220 000 — 320 000 ₽",
    tags: ["React", "TypeScript", "Next.js"],
    source: "HH",
    posted: "5 часов назад",
    hot: false,
    featured: true,
  },
  {
    id: 3,
    title: "Backend Python Developer",
    company: "Ozon Tech",
    companyInitial: "O",
    companyColor: "#005BFF",
    location: "Москва",
    salary: "200 000 — 300 000 ₽",
    tags: ["Python", "FastAPI", "PostgreSQL", "Redis"],
    source: "HH",
    posted: "вчера",
    hot: false,
    featured: false,
  },
  {
    id: 4,
    title: "DevOps / Platform Engineer",
    company: "VK",
    companyInitial: "V",
    companyColor: "#0077FF",
    location: "Москва / Гибрид",
    salary: "250 000 — 380 000 ₽",
    tags: ["Kubernetes", "Terraform", "GitLab CI", "Go"],
    source: "PLATFORM",
    posted: "3 часа назад",
    hot: true,
    featured: false,
  },
  {
    id: 5,
    title: "Data Engineer",
    company: "Сбер",
    companyInitial: "С",
    companyColor: "#21A038",
    location: "Москва / Удалённо",
    salary: "230 000 — 350 000 ₽",
    tags: ["Apache Spark", "Airflow", "Python", "ClickHouse"],
    source: "HH",
    posted: "1 день назад",
    hot: false,
    featured: false,
  },
  {
    id: 6,
    title: "Fullstack Developer (Node + React)",
    company: "Авито",
    companyInitial: "А",
    companyColor: "#00AAFF",
    location: "Удалённо",
    salary: "180 000 — 260 000 ₽",
    tags: ["Node.js", "React", "MongoDB", "TypeScript"],
    source: "PLATFORM",
    posted: "6 часов назад",
    hot: false,
    featured: false,
  },
];

function VacancyCard({
  v,
  index,
}: {
  v: (typeof VACANCIES)[0];
  index: number;
}) {
  const isPlatform = v.source === "PLATFORM";

  return (
    <Link
      href={`/vacancies/${v.id}`}
      className={clsx(
        "group relative block bg-white rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        v.featured
          ? "border-[#F5A623] shadow-md shadow-amber-100"
          : "border-[#E8E3DA] hover:border-[#C5BFB5]",
        "opacity-0 animate-fade-up",
      )}
      style={{
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "forwards",
      }}
    >
      {v.featured && (
        <div className="absolute -top-3 left-5 flex items-center gap-1 bg-[#F5A623] text-[#0D0D0F] text-xs font-bold px-3 py-1 rounded-full">
          <Star size={10} fill="currentColor" />
          Рекомендуем
        </div>
      )}

      {v.hot && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-[#C0392B] text-xs font-bold">
          <Zap size={12} fill="currentColor" />
          Горячая
        </div>
      )}

      {isPlatform && !v.hot && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-[#1A7A5E] text-xs font-semibold bg-[#E6F5F0] px-2 py-1 rounded-full">
          <TrendingUp size={11} />
          Платформа
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold shadow-sm"
          style={{
            background: v.companyColor,
            color: (v as any).companyTextColor || "#fff",
          }}
        >
          {v.companyInitial}
        </div>
        <div>
          <div className="text-sm font-semibold text-[#0D0D0F] group-hover:text-[#1A7A5E] transition-colors">
            {v.company}
          </div>
          <div className="flex items-center gap-1 text-xs text-[#A09890]">
            <MapPin size={11} />
            {v.location}
          </div>
        </div>
      </div>

      <h3
        className="text-lg font-semibold text-[#0D0D0F] mb-1 leading-snug group-hover:text-[#1A7A5E] transition-colors"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {v.title}
      </h3>

      <div className="text-base font-bold text-[#0D0D0F] mb-4">{v.salary}</div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {v.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium bg-[#F7F5F0] text-[#6B6B7A] px-2.5 py-1 rounded-lg border border-[#E8E3DA]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#F0ECE6]">
        <div className="flex items-center gap-1.5 text-xs text-[#A09890]">
          <Clock size={12} />
          {v.posted}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-[#1A7A5E] opacity-0 group-hover:opacity-100 transition-opacity">
          Подробнее
          <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedVacancies() {
  return (
    <section className="py-20 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#A09890] mb-3">
              Актуально
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold text-[#0D0D0F] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Свежие вакансии
            </h2>
            <p className="text-[#6B6B7A] mt-2 text-base">
              Обновляется каждые 6 часов с HH.ru и платформы
            </p>
          </div>
          <Link
            href="/vacancies"
            className="flex items-center gap-2 text-sm font-semibold text-[#0D0D0F] hover:text-[#1A7A5E] transition-colors group whitespace-nowrap self-start sm:self-auto"
          >
            Все вакансии
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {VACANCIES.map((v, i) => (
            <VacancyCard key={v.id} v={v} index={i} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/vacancies"
            className="inline-flex items-center gap-2 bg-[#0D0D0F] text-[#F7F5F0] px-8 py-4 rounded-xl text-sm font-semibold hover:bg-[#F5A623] hover:text-[#0D0D0F] transition-all duration-300 group"
          >
            Смотреть все 12 438 вакансий
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
