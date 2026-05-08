"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks";
import { useAuth as useAuthStore } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [isUserType, setIsUserType] = useState(false);
  const [userType, setUserType] = useState("user");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    loading,
    error,
    clearError,
    login: performLogin,
    register: performRegister,
  } = useAuth();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  async function submitAuth() {
    const payload = { email, password };

    if (mode === "register") {
      await performRegister(payload);
      return;
    }

    await performLogin(payload);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f1e9]">
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#d8e7d6] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-[#f0d6b8] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#161616]/10 bg-white/75 shadow-[0_25px_90px_rgba(20,20,20,0.12)] backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
          <section className="border-b border-[#161616]/10 bg-[#161616] p-8 text-white lg:border-b-0 lg:border-r lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Intern Hub
            </p>
            <h1 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl">
              Вход и регистрация
              <span className="mt-1 block text-[#b8d6c1]">
                в одном месте
              </span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/75 sm:text-base">
              Аккаунтом можно пользоваться сразу. После регистрации мы отправим
              письмо, чтобы подтвердить адрес почты.
            </p>

            <div className="mt-8 space-y-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold">Для соискателей</p>
                <p className="mt-1 text-sm text-white/70">
                  Поиск стажировок, вакансий и материалов для подготовки.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-sm font-semibold">Для работодателей</p>
                <p className="mt-1 text-sm text-white/70">
                  Публикация вакансий и управление кандидатами.
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            {!isUserType ? (
              <div className="mx-auto w-full max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#567059]">
                  Шаг 1 из 2
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#171717]">
                  Выберите роль
                </h2>
                <p className="mt-2 text-sm text-[#585858]">
                  От этого зависит сценарий работы с платформой.
                </p>

                <div className="mt-6 space-y-3">
                  <RoleButton
                    active={userType === "user"}
                    icon={<BriefcaseBusiness className="h-5 w-5" />}
                    title="Я ищу работу"
                    description="Создать профиль соискателя"
                    tone="candidate"
                    onClick={() => setUserType("user")}
                  />
                  <RoleButton
                    active={userType === "employer"}
                    icon={<Building2 className="h-5 w-5" />}
                    title="Я ищу сотрудников"
                    description="Создать профиль работодателя"
                    tone="employer"
                    onClick={() => setUserType("employer")}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Button
                    className="h-11 w-full rounded-xl bg-[#171717] text-white hover:bg-black"
                    onClick={() => {
                      clearError();
                      setMode("login");
                      setIsUserType(true);
                    }}
                  >
                    Войти
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl border-[#171717]/20 bg-white hover:bg-[#f8f8f8]"
                    onClick={() => {
                      clearError();
                      setMode("register");
                      setIsUserType(true);
                    }}
                  >
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="mx-auto w-full max-w-md"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await submitAuth();
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#567059]">
                  Шаг 2 из 2
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#171717]">
                  {mode === "register" ? "Регистрация" : "Вход"}
                </h2>
                <p className="mt-2 text-sm text-[#585858]">
                  {mode === "register"
                    ? "После регистрации отправим письмо для подтверждения почты."
                    : "Введите данные аккаунта для продолжения."}
                </p>

                <div className="mt-6 space-y-3">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      clearError();
                      setEmail(event.target.value);
                    }}
                    placeholder="Email"
                    className="h-11 rounded-xl border-[#161616]/20 bg-white"
                    required
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => {
                      clearError();
                      setPassword(event.target.value);
                    }}
                    placeholder="Пароль"
                    className="h-11 rounded-xl border-[#161616]/20 bg-white"
                    required
                  />
                </div>

                {mode === "login" ? (
                  <Link
                    href="/auth/forgot-password"
                    className="mt-3 inline-flex text-sm font-semibold text-[#48644d] hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                ) : null}

                {error ? (
                  <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error.message}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-6 h-11 w-full rounded-xl bg-[#171717] text-white hover:bg-black"
                >
                  {loading
                    ? "Подождите..."
                    : mode === "register"
                      ? "Создать аккаунт"
                      : "Войти"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setIsUserType(false);
                  }}
                  className="mt-4 w-full rounded-xl border border-[#161616]/15 bg-white px-4 py-2.5 text-sm text-[#484848] transition hover:bg-[#f7f7f7]"
                >
                  Назад к выбору роли
                </button>

                <div className="mt-6 flex items-start gap-2 rounded-xl border border-[#161616]/10 bg-[#f7f7f3] p-3 text-xs text-[#5f5f5f]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[#567059]" />
                  <p>
                    Подтверждение почты влияет только на статус адреса.
                    Пользоваться аккаунтом можно сразу после регистрации.
                  </p>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function RoleButton({
  active,
  icon,
  title,
  description,
  tone,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  tone: "candidate" | "employer";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5",
        active
          ? "border-[#171717] shadow-md"
          : "border-[#161616]/15 hover:border-[#171717]/35",
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "rounded-xl p-2.5",
            tone === "candidate"
              ? "bg-[#edf3ea] text-[#3e5b44]"
              : "bg-[#f5ede3] text-[#6f4f35]",
          )}
        >
          {icon}
        </div>
        <div>
          <p className="font-semibold text-[#171717]">{title}</p>
          <p className="mt-1 text-sm text-[#626262]">{description}</p>
        </div>
      </div>
    </button>
  );
}
