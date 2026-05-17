"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inviteCandidateToChat } from "@/lib/api/chats";
import {
  getEmployerVacancies,
  type EmployerVacancy,
} from "@/lib/api/profile";

export function ChatInviteDialog({
  resumeId,
  candidateName,
  open,
  onOpenChange,
}: {
  resumeId: number;
  candidateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [vacancies, setVacancies] = useState<EmployerVacancy[]>([]);
  const [vacancyPublicId, setVacancyPublicId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;

    async function loadVacancies() {
      try {
        setLoading(true);
        const response = await getEmployerVacancies(0, 100);
        if (!active) return;

        const loadedVacancies = response.content;
        setVacancies(loadedVacancies);
        setVacancyPublicId((current) => current || loadedVacancies[0]?.publicId || "");
      } catch (error) {
        console.error("Failed to load employer vacancies:", error);
        if (active) {
          toast.error("Не удалось загрузить ваши вакансии.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVacancies();

    return () => {
      active = false;
    };
  }, [open]);

  async function submitInvite() {
    if (!vacancyPublicId) {
      toast.message("Выберите вакансию для приглашения.");
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.message("Напишите первое сообщение для соискателя.");
      return;
    }

    try {
      setSubmitting(true);
      const room = await inviteCandidateToChat(resumeId, {
        vacancyPublicId,
        message: trimmedMessage,
      });
      toast.success("Приглашение отправлено, чат создан.");
      onOpenChange(false);
      setMessage("");

      window.dispatchEvent(
        new CustomEvent("intern-hub:open-chat", {
          detail: { chatId: room.chatId },
        }),
      );
    } catch (error) {
      console.error("Failed to invite candidate:", error);
      toast.error("Не удалось создать приглашение.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#0b63f6]" />
            Пригласить в чат
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-[#626262]">
            Выберите вакансию, по которой хотите обсудить собеседование с{" "}
            <span className="font-semibold text-[#171717]">{candidateName}</span>.
          </p>

          <label className="block space-y-2 text-sm font-semibold text-[#171717]">
            <span>Вакансия</span>
            <select
              value={vacancyPublicId}
              onChange={(event) => setVacancyPublicId(event.target.value)}
              className="h-11 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:border-[#0b63f6]"
              disabled={loading || submitting}
            >
              {vacancies.map((vacancy) => (
                <option key={vacancy.publicId} value={vacancy.publicId}>
                  {vacancy.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-[#171717]">
            <span>Сообщение</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Например: хотим пригласить вас на собеседование"
              className="min-h-28 w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-[#0b63f6]"
              disabled={submitting}
              required
            />
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className="bg-[#0b63f6] text-white"
              onClick={submitInvite}
              disabled={loading || submitting || !vacancies.length || !message.trim()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4" />
              )}
              Создать чат
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
