"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      await requestPasswordReset(email);
      setMessage("Письмо для смены пароля отправлено.");
    } catch {
      setError("Не удалось отправить письмо. Проверьте email и попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-10">
      <section className="mx-auto max-w-md rounded-2xl border border-[#161616]/10 bg-white/90 p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#48644d]">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[#171717]">
          Смена пароля
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#626262]">
          Введите email аккаунта, и мы отправим ссылку для установки нового
          пароля.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await submit();
          }}
        >
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            required
          />
          {message ? (
            <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button
            disabled={isLoading}
            className="h-11 w-full rounded-xl bg-[#171717] text-white"
          >
            {isLoading ? "Отправка..." : "Отправить письмо"}
          </Button>
        </form>

        <Link
          href="/auth"
          className="mt-4 inline-flex text-sm font-semibold text-[#48644d] hover:underline"
        >
          Вернуться ко входу
        </Link>
      </section>
    </main>
  );
}
