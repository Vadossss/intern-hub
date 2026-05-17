"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/lib/api/auth";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const token = useSearchParams().get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        await verifyEmail(token);
        if (isMounted) setStatus("success");
      } catch {
        if (isMounted) setStatus("error");
      }
    }

    if (token) {
      run();
    } else {
      setStatus("error");
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-10">
      <section className="mx-auto max-w-md rounded-2xl border border-[#161616]/10 bg-white/90 p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#48644d]">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-[#171717]">
          Подтверждение почты
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#626262]">
          {status === "loading"
            ? "Проверяем ссылку..."
            : status === "success"
              ? "Почта подтверждена. Спасибо!"
              : "Не удалось подтвердить почту. Ссылка могла устареть."}
        </p>
        <Button asChild className="mt-6 h-11 w-full rounded-xl bg-[#171717] text-white">
          <Link href="/profile">Перейти в профиль</Link>
        </Button>
      </section>
    </main>
  );
}
