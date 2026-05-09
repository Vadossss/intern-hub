"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageSquareText } from "lucide-react";

import type { VacancyContact } from "@/app/types/api";
import type { CandidateResume } from "@/lib/api/profile";
import { cn } from "@/lib/utils";

import { ExternalApplyLink } from "./ExternalApplyLink";
import { InternalApplyDialog } from "./InternalApplyDialog";
import { InternalApplyLink } from "./InternalApplyLink";
import type { ApplyMode } from "./vacancyDetailsTypes";

export function ApplyCard({
  applyMode,
  coverLetter,
  externalContacts,
  hasActiveResume,
  hasInternalApply,
  hasApplied,
  isAuthenticated,
  isResumeLoading,
  isSubmitting,
  resumeUrl,
  resumes,
  selectedResumeId,
  userRole,
  onApplyModeChange,
  onCoverLetterChange,
  onResumeChange,
  onResumeUrlChange,
  onSubmit,
}: {
  applyMode: ApplyMode;
  coverLetter: string;
  externalContacts: VacancyContact[];
  hasActiveResume: boolean;
  hasInternalApply: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
  isResumeLoading: boolean;
  isSubmitting: boolean;
  resumeUrl: string;
  resumes: CandidateResume[];
  selectedResumeId: number | null;
  userRole?: string;
  onApplyModeChange: (mode: ApplyMode) => void;
  onCoverLetterChange: (value: string) => void;
  onResumeChange: (resumeId: number | null) => void;
  onResumeUrlChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const canApplyInternally =
    isAuthenticated &&
    userRole === "ROLE_USER" &&
    hasActiveResume &&
    !hasApplied &&
    Boolean(selectedResumeId) &&
    !isResumeLoading;
  const hasExternalApply = externalContacts.length > 0;
  const shouldShowModeSwitcher = hasInternalApply && hasExternalApply;
  const visibleMode = shouldShowModeSwitcher
    ? applyMode
    : hasInternalApply
      ? "internal"
      : "external";
  const [isInternalDialogOpen, setIsInternalDialogOpen] = useState(false);

  return (
    <aside className="sticky top-24 rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
            Отклик
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#171717]">
            Выберите способ
          </h2>
        </div>
        <div className="rounded-xl bg-[#edf3ea] p-3 text-[#3f5f4a]">
          <MessageSquareText className="h-5 w-5" />
        </div>
      </div>

      {shouldShowModeSwitcher ? (
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-1">
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-extrabold transition",
              applyMode === "internal"
                ? "bg-[#171717] text-white"
                : "text-[#555] hover:bg-white",
            )}
            onClick={() => onApplyModeChange("internal")}
          >
            Внутри сайта
          </button>
          <button
            type="button"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-extrabold transition",
              applyMode === "external"
                ? "bg-[#171717] text-white"
                : "text-[#555] hover:bg-white",
            )}
            onClick={() => onApplyModeChange("external")}
          >
            Внешний
          </button>
        </div>
      ) : null}

      {visibleMode === "internal" ? (
        <div className="mt-5 space-y-3">
          {hasInternalApply ? (
            <InternalApplyLink onClick={() => setIsInternalDialogOpen(true)} />
          ) : (
            <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
              Работодатель не добавил внутренний способ отклика для этой вакансии.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {externalContacts.length ? (
            externalContacts.map((contact, index) => (
              <ExternalApplyLink
                key={`${contact.chosenContactMethod}-${contact.contactValue}-${index}`}
                contact={contact}
              />
            ))
          ) : (
            <div className="rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-4 text-sm leading-6 text-[#555]">
              Работодатель не добавил внешний способ отклика для этой вакансии.
            </div>
          )}
        </div>
      )}

      <InternalApplyDialog
        canApplyInternally={canApplyInternally}
        coverLetter={coverLetter}
        hasActiveResume={hasActiveResume}
        hasApplied={hasApplied}
        isAuthenticated={isAuthenticated}
        isOpen={isInternalDialogOpen}
        isResumeLoading={isResumeLoading}
        isSubmitting={isSubmitting}
        resumeUrl={resumeUrl}
        resumes={resumes}
        selectedResumeId={selectedResumeId}
        userRole={userRole}
        onCoverLetterChange={onCoverLetterChange}
        onOpenChange={setIsInternalDialogOpen}
        onResumeChange={onResumeChange}
        onResumeUrlChange={onResumeUrlChange}
        onSubmit={onSubmit}
      />
    </aside>
  );
}
