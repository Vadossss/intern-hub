"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Briefcase, BookOpen, ChevronDown } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  {
    label: "Вакансии",
    href: "/vacancies",
    icon: Briefcase,
    sub: [
      { label: "Все вакансии", href: "/vacancies" },
      { label: "Java / Backend", href: "/vacancies?exp=java" },
      { label: "Frontend", href: "/vacancies?exp=frontend" },
      { label: "DevOps", href: "/vacancies?exp=devops" },
      { label: "Data Science", href: "/vacancies?exp=data" },
    ],
  },
  {
    label: "Обучение",
    href: "/prep",
    icon: BookOpen,
    sub: [
      { label: "Вопросы с собеседований", href: "/prep/questions" },
      { label: "Тестовые задания", href: "/prep/tasks" },
      { label: "Идеи для пет-проектов", href: "/prep/pet-projects" },
    ],
  },
  { label: "Компании", href: "/companies" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#F7F5F0]/95 backdrop-blur-md border-b border-[#E8E3DA] shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#0D0D0F] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#F5A623] transition-colors duration-300">
              <span className="text-[#F7F5F0] text-sm font-bold font-mono">
                К
              </span>
            </div>
            <span
              className="text-xl font-semibold tracking-tight hidden sm:block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Карьера
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.sub && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#2A2A32] hover:text-[#0D0D0F] rounded-lg hover:bg-[#EDE9E1] transition-all duration-200"
                >
                  {item.label}
                  {item.sub && (
                    <ChevronDown
                      size={14}
                      className={clsx(
                        "transition-transform duration-200",
                        activeDropdown === item.label && "rotate-180",
                      )}
                    />
                  )}
                </Link>

                {item.sub && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-[#E8E3DA] py-1.5 animate-fade-in">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2.5 text-sm text-[#2A2A32] hover:text-[#0D0D0F] hover:bg-[#F7F5F0] transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#2A2A32] hover:text-[#0D0D0F] px-4 py-2 rounded-lg hover:bg-[#EDE9E1] transition-all duration-200"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-[#0D0D0F] text-[#F7F5F0] px-5 py-2.5 rounded-xl hover:bg-[#F5A623] hover:text-[#0D0D0F] transition-all duration-300"
            >
              Разместить вакансию
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#EDE9E1] transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#F7F5F0] border-t border-[#E8E3DA] animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block py-3 text-base font-medium text-[#0D0D0F] border-b border-[#EDE9E1]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.sub && (
                  <div className="pl-4 py-1 space-y-0.5">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block py-2 text-sm text-[#6B6B7A] hover:text-[#0D0D0F]"
                        onClick={() => setMobileOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-center py-3 text-sm font-medium border border-[#0D0D0F] rounded-xl"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="text-center py-3 text-sm font-medium bg-[#0D0D0F] text-[#F7F5F0] rounded-xl"
              >
                Разместить вакансию
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
