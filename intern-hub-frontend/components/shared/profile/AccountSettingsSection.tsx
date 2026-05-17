"use client";

import type { FormEvent } from "react";
import { AtSign, KeyRound, MailCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/auth/context";

export function AccountSettingsSection({
  user,
  isSaving,
  onEmailChange,
  onPasswordResetRequest,
  onResendVerification,
}: {
  user: User;
  isSaving: boolean;
  onEmailChange: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordResetRequest: () => void;
  onResendVerification: () => void;
}) {
  const isVerified = user.verified === true;

  return (
    <div className="grid gap-6">
      <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-2xl">
                Настройки аккаунта
              </CardTitle>
              <p className="mt-2 text-sm text-[#626262]">
                Управление почтой, подтверждением и восстановлением пароля.
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isVerified
                  ? "w-fit rounded-lg border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "w-fit rounded-lg border-amber-200 bg-amber-50 text-amber-800"
              }
            >
              {isVerified
                ? "Почта подтверждена"
                : "Почта не подтверждена"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl border border-[#161616]/10 bg-[#faf9f4] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#48644d]">
                <MailCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#171717]">
                  Подтверждение почты
                </p>
                <p className="mt-1 break-words text-sm text-[#626262]">
                  Текущий адрес: {user.email}
                </p>
                {!isVerified ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3 rounded-xl"
                    disabled={isSaving}
                    onClick={onResendVerification}
                  >
                    Отправить письмо подтверждения
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <form
            onSubmit={onEmailChange}
            className="rounded-2xl border border-[#161616]/10 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ea] text-[#48644d]">
                <AtSign className="h-5 w-5" />
              </span>
              <div className="grid min-w-0 flex-1 gap-3">
                <div>
                  <p className="font-semibold text-[#171717]">
                    Смена почты
                  </p>
                  <p className="mt-1 text-sm text-[#626262]">
                    После смены адрес нужно будет подтвердить заново.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <Input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    placeholder="Новая почта"
                    required
                  />
                  <Button
                    disabled={isSaving}
                    className="rounded-xl bg-[#171717] text-white"
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </form>

          <div className="rounded-2xl border border-[#161616]/10 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eee5] text-[#7a5a27]">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#171717]">
                  Смена пароля
                </p>
                <p className="mt-1 text-sm text-[#626262]">
                  На почту придёт ссылка для безопасной смены пароля.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 rounded-xl"
                  disabled={isSaving}
                  onClick={onPasswordResetRequest}
                >
                  Отправить ссылку
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
