import type { ReactNode } from "react";
import { Archive, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DictionaryItem } from "@/lib/api/dictionaries";
import type { CandidateResume } from "@/lib/api/profile";
import { cn } from "@/lib/utils";

import type { ResumeConfirmAction } from "@/components/shared/profile/CandidateResumesSection.types";
import { fieldControlClass } from "@/components/shared/profile/CandidateResumesSection.utils";

export function ResumeConfirmDialog({
  action,
  isSaving,
  resume,
  onConfirm,
  onOpenChange,
}: {
  action: ResumeConfirmAction | null;
  isSaving: boolean;
  resume: CandidateResume | null;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const isDelete = action === "delete";

  return (
    <Dialog open={Boolean(action && resume)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isDelete ? "Удалить резюме?" : "Архивировать резюме?"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[#555]">
            {isDelete
              ? `Резюме "${resume?.profession || "без названия"}" будет удалено без возможности восстановления.`
              : `Резюме "${resume?.profession || "без названия"}" уйдет в архив и не будет отображаться работодателям.`}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              className={
                isDelete
                  ? "rounded-xl bg-red-700 text-white hover:bg-red-800"
                  : "rounded-xl bg-[#171717] text-white hover:bg-black"
              }
              disabled={isSaving}
              onClick={() => void onConfirm()}
            >
              {isDelete ? (
                <Trash2 className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {isSaving
                ? "Выполняем..."
                : isDelete
                  ? "Да, удалить"
                  : "Да, архивировать"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DictionarySelect({
  name,
  defaultValue,
  placeholder,
  items,
  error,
  onValueChange,
  required = false,
}: {
  name: string;
  defaultValue?: string;
  placeholder: string;
  items: DictionaryItem[];
  error?: string;
  onValueChange?: () => void;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 rounded-md border border-input bg-white px-3 text-sm text-[#333] shadow-sm outline-none transition",
          "focus:border-ring focus:ring-ring/50 focus:ring-[3px]",
          fieldControlClass(error),
        )}
        onChange={onValueChange}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-sm font-semibold text-red-600">{message}</p>;
}

export function ResumeMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#161616]/10 bg-white p-3">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#777]">
        {icon}
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-[#171717]">
        {value}
      </p>
    </div>
  );
}
