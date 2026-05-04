import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "Размещение вакансий бесплатно",
  "Отклики напрямую через платформу",
  "Встроенный мессенджер с кандидатами",
  "Объединение с профилем компании с HH",
];

export default function EmployerCTA() {
  return (
    <section className="py-20 bg-[#0D0D0F] text-[#F7F5F0] relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-[0.06] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 20%, #F5A623, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.04] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #1A7A5E, transparent 60%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#A09890] mb-4">
              Для работодателей
            </div>
            <h2
              className="text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Найдите лучших
              <br />
              <span className="italic text-[#F5A623]">разработчиков</span>
              <br />
              напрямую
            </h2>
            <p className="text-[#A09890] leading-relaxed mb-8 text-base">
              Размещайте вакансии, получайте отклики и общайтесь с кандидатами
              без посредников. Платформа объединяет ваш профиль с вакансиями с
              HH — всё в одном месте.
            </p>

            <ul className="space-y-3 mb-10">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="text-[#2FA882] flex-shrink-0"
                  />
                  <span className="text-sm text-[#D4D0C8]">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register?role=employer"
                className="flex items-center justify-center gap-2 bg-[#F5A623] text-[#0D0D0F] px-7 py-4 rounded-xl text-sm font-bold hover:bg-[#FBC45A] transition-colors duration-200 group"
              >
                Зарегистрироваться бесплатно
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/how-it-works"
                className="flex items-center justify-center gap-2 border border-white/20 text-[#F7F5F0] px-7 py-4 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Как это работает
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="bg-[#1A1A1F] rounded-2xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-[#F7F5F0]">
                  Мои вакансии
                </span>
                <span className="text-xs text-[#A09890] bg-white/5 px-3 py-1 rounded-full">
                  4 активных
                </span>
              </div>
              {[
                { title: "Senior Java Developer", apps: 12, status: "active" },
                { title: "DevOps Engineer", apps: 7, status: "active" },
                { title: "Frontend React", apps: 23, status: "hot" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium text-[#F7F5F0]">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#6B6B7A] mt-0.5">
                      {item.apps} откликов
                    </div>
                  </div>
                  <div
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.status === "hot"
                        ? "bg-[#FDECEA] text-[#C0392B]"
                        : "bg-[#E6F5F0] text-[#1A7A5E]"
                    }`}
                  >
                    {item.status === "hot" ? "🔥 Горячая" : "Активна"}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: "Просмотры", value: "1 247" },
                  { label: "Отклики", value: "42" },
                  { label: "В диалоге", value: "8" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/5 rounded-xl p-3 text-center"
                  >
                    <div
                      className="text-xl font-bold text-[#F5A623]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-xs text-[#6B6B7A] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-[#E8E3DA] flex items-center gap-3 animate-float">
              <div className="w-8 h-8 bg-[#E6F5F0] rounded-full flex items-center justify-center">
                <span className="text-sm">💬</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#0D0D0F]">
                  Новый отклик!
                </div>
                <div className="text-xs text-[#6B6B7A]">
                  Senior Java Developer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
