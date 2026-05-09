"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CandidateResume } from "@/lib/api/profile";

import {
  resumeOptionLabel,
  resumeSummary,
} from "./vacancyDetailsHelpers";

export function InternalApplyDialog({
  canApplyInternally,
  coverLetter,
  hasActiveResume,
  hasApplied,
  isAuthenticated,
  isOpen,
  isResumeLoading,
  isSubmitting,
  resumeUrl,
  resumes,
  selectedResumeId,
  userRole,
  onCoverLetterChange,
  onOpenChange,
  onResumeChange,
  onResumeUrlChange,
  onSubmit,
}: {
  canApplyInternally: boolean;
  coverLetter: string;
  hasActiveResume: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
  isOpen: boolean;
  isResumeLoading: boolean;
  isSubmitting: boolean;
  resumeUrl: string;
  resumes: CandidateResume[];
  selectedResumeId: number | null;
  userRole?: string;
  onCoverLetterChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onResumeChange: (resumeId: number | null) => void;
  onResumeUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const selectedResume = resumes.find(
    (resume) => resume.id === selectedResumeId,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Отклик внутри Intern Hub</DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Войдите как соискатель, чтобы отправить отклик работодателю внутри
            Intern Hub.
            <Button
              asChild
              className="mt-3 w-full rounded-xl bg-[#171717] text-white"
            >
              <Link href="/auth">Войти</Link>
            </Button>
          </div>
        ) : userRole !== "ROLE_USER" ? (
          <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
            Внутренний отклик доступен только аккаунту соискателя.
          </div>
        ) : isResumeLoading ? (
          <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
            Проверяем активные резюме. Подождите несколько секунд.
          </div>
        ) : !hasActiveResume ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Для отклика нужно хотя бы одно активное резюме. Создайте или
            верните резюме из архива в профиле.
            <Button
              asChild
              className="mt-3 w-full rounded-xl bg-[#171717] text-white"
            >
              <Link href="/profile?section=resumes">Перейти к резюме</Link>
            </Button>
          </div>
        ) : hasApplied ? (
          <div className="rounded-xl border border-[#d7e8d7] bg-[#edf3ea] p-4 text-sm leading-6 text-[#34533a]">
            Отклик уже отправлен. Работодатель увидит его в своём кабинете.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Резюме для отклика
              </span>
              <select
                value={selectedResumeId ?? ""}
                required
                className="mt-2 h-11 w-full rounded-xl border border-[#161616]/10 bg-white px-3 text-sm font-semibold text-[#333] outline-none transition focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) =>
                  onResumeChange(Number(event.target.value) || null)
                }
              >
                <option value="" disabled>
                  Выберите резюме
                </option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resumeOptionLabel(resume)}
                  </option>
                ))}
              </select>
              {selectedResume ? (
                <p className="mt-2 text-xs leading-5 text-[#666]">
                  {resumeSummary(selectedResume)}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Сопроводительное письмо
              </span>
              <textarea
                value={coverLetter}
                rows={5}
                placeholder="Коротко расскажите, почему вам интересна вакансия."
                className="mt-2 min-h-32 w-full resize-y rounded-xl border border-[#161616]/10 bg-white px-3 py-3 text-sm leading-6 text-[#333] outline-none transition placeholder:text-[#999] focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) => onCoverLetterChange(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-extrabold text-[#171717]">
                Дополнительная ссылка на резюме
              </span>
              <input
                value={resumeUrl}
                type="url"
                placeholder="https://..."
                className="mt-2 h-11 w-full rounded-xl border border-[#161616]/10 bg-white px-3 text-sm text-[#333] outline-none transition placeholder:text-[#999] focus:border-[#3f5f4a]/50 focus:ring-4 focus:ring-[#3f5f4a]/10"
                onChange={(event) => onResumeUrlChange(event.target.value)}
              />
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => onOpenChange(false)}
              >
                Закрыть
              </Button>
              <Button
                type="submit"
                disabled={!canApplyInternally || isSubmitting}
                className="rounded-xl bg-[#171717] font-extrabold text-white hover:bg-black"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Отправляем..." : "Отправить отклик"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
