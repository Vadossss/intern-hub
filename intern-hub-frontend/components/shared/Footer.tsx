import Link from "next/link";

const FOOTER_LINKS = {
  Вакансии: [
    { label: "Все вакансии", href: "/vacancies" },
    { label: "Java / Backend", href: "/vacancies?tech=java" },
    { label: "Frontend", href: "/vacancies?tech=frontend" },
    { label: "DevOps", href: "/vacancies?tech=devops" },
    { label: "Data Science", href: "/vacancies?tech=data" },
    { label: "Компании", href: "/employers" },
  ],
  Обучение: [
    { label: "Вопросы с собеседований", href: "/prep/questions" },
    { label: "Тестовые задания", href: "/prep/tasks" },
    { label: "Пет-проекты", href: "/prep/pet-projects" },
    { label: "Категории", href: "/prep" },
  ],
  Платформа: [
    { label: "Для работодателей", href: "/employers" },
    { label: "Разместить вакансию", href: "/register?role=employer" },
    { label: "Как это работает", href: "/how-it-works" },
    { label: "Блог", href: "/blog" },
    { label: "О проекте", href: "/about" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#F0ECE5] border-t border-[#E0DBD2]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-[#0D0D0F] rounded-xl flex items-center justify-center">
                <span className="text-[#F7F5F0] text-sm font-bold font-mono">
                  К
                </span>
              </div>
              <span
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Карьера
              </span>
            </div>
            <p className="text-sm text-[#6B6B7A] leading-relaxed mb-6 max-w-[220px]">
              Агрегатор вакансий и платформа для подготовки к техническим
              собеседованиям.
            </p>
            <div className="flex gap-3">
              {["TG", "VK", "HB"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#E8E3DA] hover:bg-[#0D0D0F] hover:text-[#F7F5F0] flex items-center justify-center text-xs font-bold text-[#6B6B7A] transition-all duration-200"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#A09890] mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6B6B7A] hover:text-[#0D0D0F] link-underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-[#E0DBD2] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#A09890]">
          <div>© 2025 Карьера. Сделано с ♥ для разработчиков</div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-[#0D0D0F] transition-colors"
            >
              Конфиденциальность
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#0D0D0F] transition-colors"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
