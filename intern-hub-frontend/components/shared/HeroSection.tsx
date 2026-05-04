"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase, ArrowRight } from "lucide-react";

const POPULAR_SEARCHES = [
  "Java разработчик",
  "Frontend React",
  "Python Backend",
  "DevOps",
  "Data Engineer",
  "Fullstack",
];

const QUICK_FILTERS = [
  { label: "Удалённо", value: "remote" },
  { label: "Москва", value: "moscow" },
  { label: "От 200k", value: "200k" },
  { label: "Junior", value: "junior" },
  { label: "Senior", value: "senior" },
];

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("title", query);
    if (location) params.set("location", location);
    router.push(`/vacancies?${params.toString()}`);
  };

  const handlePopular = (term: string) => {
    router.push(`/vacancies?title=${encodeURIComponent(term)}`);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #F5A623 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #1A7A5E 0%, transparent 70%)",
          }}
        />
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-96 opacity-[0.04]"
          viewBox="0 0 256 384"
          fill="none"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={i * 32}
              y1="0"
              x2={i * 32}
              y2="384"
              stroke="#0D0D0F"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 32}
              x2="256"
              y2={i * 32}
              stroke="#0D0D0F"
              strokeWidth="1"
            />
          ))}
        </svg>

        <div
          className="absolute right-12 top-36 hidden xl:flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-lg border border-[#E8E3DA] animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="w-10 h-10 bg-[#E6F5F0] rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-[#1A7A5E]" />
          </div>
          <div>
            <div className="text-xs text-[#6B6B7A] font-medium">
              Новых вакансий сегодня
            </div>
            <div
              className="text-lg font-bold text-[#0D0D0F]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              +347
            </div>
          </div>
        </div>

        <div
          className="absolute left-8 bottom-48 hidden xl:flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-lg border border-[#E8E3DA] animate-float"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="w-3 h-3 rounded-full bg-[#2FA882] animate-pulse-dot" />
          <div className="text-sm font-medium text-[#0D0D0F]">
            12 438 активных вакансий
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE9E1] border border-[#D9D3C8] text-sm font-medium text-[#6B6B7A] mb-8 opacity-0 animate-fade-up"
            style={{ animationFillMode: "forwards" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#2FA882] animate-pulse-dot" />
            Агрегатор вакансий + подготовка к собеседованиям
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 opacity-0 animate-fade-up stagger-2 text-balance"
            style={{
              fontFamily: "var(--font-display)",
              animationFillMode: "forwards",
            }}
          >
            Найди работу
            <br />
            <span className="italic text-[#F5A623]">своей мечты</span>
            <br />
            <span className="text-[#6B6B7A]">— и подготовься</span>
          </h1>

          <p
            className="text-lg text-[#6B6B7A] leading-relaxed mb-10 max-w-xl opacity-0 animate-fade-up stagger-3"
            style={{ animationFillMode: "forwards" }}
          >
            Тысячи вакансий с HH.ru и других платформ в одном месте. Плюс
            вопросы с реальных собеседований, тестовые задания и идеи для
            портфолио.
          </p>

          <form
            onSubmit={handleSearch}
            className="relative opacity-0 animate-fade-up stagger-4"
            style={{ animationFillMode: "forwards" }}
          >
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-lg border border-[#E8E3DA]">
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <Search size={18} className="text-[#A09890] flex-shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Должность, ключевые слова..."
                  className="w-full bg-transparent text-[#0D0D0F] placeholder-[#A09890] text-sm outline-none font-medium"
                />
              </div>

              <div className="hidden sm:block w-px bg-[#E8E3DA] my-2" />

              <div className="flex items-center gap-3 sm:w-48 px-4 py-2">
                <MapPin size={18} className="text-[#A09890] flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Город или удалённо"
                  className="w-full bg-transparent text-[#0D0D0F] placeholder-[#A09890] text-sm outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[#0D0D0F] text-[#F7F5F0] px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-[#F5A623] hover:text-[#0D0D0F] transition-all duration-300 group flex-shrink-0"
              >
                Найти
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => router.push(`/vacancies?filter=${f.value}`)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#EDE9E1] text-[#2A2A32] hover:bg-[#0D0D0F] hover:text-[#F7F5F0] transition-all duration-200 border border-transparent hover:border-[#0D0D0F]"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </form>

          <div
            className="mt-8 opacity-0 animate-fade-up stagger-5"
            style={{ animationFillMode: "forwards" }}
          >
            <span className="text-xs font-medium text-[#A09890] uppercase tracking-widest mr-3">
              Ищут сейчас:
            </span>
            {POPULAR_SEARCHES.map((term, i) => (
              <button
                key={term}
                onClick={() => handlePopular(term)}
                className={`text-sm text-[#6B6B7A] hover:text-[#0D0D0F] link-underline transition-colors mr-4 ${i > 3 ? "hidden sm:inline" : ""}`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
