"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      await resetPassword(token, password);
      setMessage("Пароль изменён. Теперь можно войти с новым паролем.");
    } catch {
      setError("Не удалось изменить пароль. Ссылка могла устареть.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-10">
      <section className="mx-auto max-w-md rounded-2xl border border-[#161616]/10 bg-white/90 p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#48644d]">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[#171717]">
          Новый пароль
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#626262]">
          Придумайте новый пароль для аккаунта.
        </p>

        <form
          className="mt-6 space-y-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await submit();
          }}
        >
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Новый пароль"
            minLength={6}
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
            disabled={isLoading || !token}
            className="h-11 w-full rounded-xl bg-[#171717] text-white"
          >
            {isLoading ? "Сохранение..." : "Сменить пароль"}
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
