"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  complaintReasonOptions,
  createComplaint,
  type ComplaintReason,
  type ComplaintTargetType,
} from "@/lib/api/complaints";
import { useAuth } from "@/lib/auth/context";

interface ComplaintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ComplaintTargetType;
  targetId: string;
  targetLabel: string;
}

export function ComplaintDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetLabel,
}: ComplaintDialogProps) {
  const { isAuthenticated } = useAuth();
  const [reason, setReason] = useState<ComplaintReason | "">("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setDescription("");
      setIsSubmitting(false);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт, чтобы отправить жалобу.");
      return;
    }

    if (!reason) {
      toast.error("Выберите причину жалобы.");
      return;
    }

    if (!targetId) {
      toast.error("Не удалось определить объект жалобы.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createComplaint({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });

      toast.success("Жалоба отправлена на модерацию.");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create complaint:", error);
      toast.error("Не удалось отправить жалобу. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-[#6f3f3f]" />
            Пожаловаться
          </DialogTitle>
          <DialogDescription>
            Выберите причину для “{targetLabel}”. Описание можно оставить
            пустым.
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-bold text-[#171717]">
                Причина
              </span>
              <select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ComplaintReason | "")
                }
                className="h-11 w-full rounded-xl border border-[#161616]/15 bg-white px-3 text-sm font-semibold text-[#171717] outline-none transition focus:border-[#3f5f4a] focus:ring-2 focus:ring-[#3f5f4a]/15"
              >
                <option value="">Выберите причину</option>
                {complaintReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-bold text-[#171717]">
                Описание
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Можно уточнить, что именно не так"
                className="min-h-28 w-full resize-y rounded-xl border border-[#161616]/15 bg-white px-3 py-2 text-sm leading-6 text-[#171717] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#3f5f4a] focus:ring-2 focus:ring-[#3f5f4a]/15"
              />
              <span className="block text-right text-xs text-[#777]">
                {description.length}/2000
              </span>
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#171717] text-white hover:bg-[#2a2a2a]"
              >
                {isSubmitting ? "Отправляем..." : "Отправить жалобу"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[#555]">
              Жалобы могут отправлять только авторизованные пользователи.
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Закрыть
              </Button>
              <Button asChild className="bg-[#171717] text-white">
                <Link href="/auth">Войти</Link>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
