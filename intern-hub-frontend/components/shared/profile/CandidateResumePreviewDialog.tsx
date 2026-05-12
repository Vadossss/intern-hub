"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";

import { RichTextContent } from "@/components/shared/RichText";
import { ResumeExtendedDetails } from "@/components/shared/profile/ResumeExtendedDetails";
import { formatDate, formatMoney } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CandidateResume } from "@/lib/api/profile";

function resumePlainText(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildReviewItems(resume: CandidateResume) {
  const aboutLength = resumePlainText(resume.about).length;

  return [
    {
      label: "Указана желаемая профессия",
      done: Boolean(resume.profession?.trim()),
    },
    {
      label: "Есть город, формат и занятость",
      done: Boolean(resume.city && resume.workFormatName && resume.employmentName),
    },
    {
      label: "Описание раскрывает опыт и цели",
      done: aboutLength >= 120,
    },
    {
      label: "Добавлены ключевые навыки",
      done: (resume.skills?.length ?? 0) >= 3,
    },
    {
      label: "Заполнены образование, опыт или языки",
      done: Boolean(
        resume.education?.length ||
          resume.workExperience?.length ||
          resume.languages?.length,
      ),
    },
  ];
}

export function CandidateResumePreviewDialog({
  open,
  resume,
  onOpenChange,
}: {
  open: boolean;
  resume: CandidateResume | null;
  onOpenChange: (open: boolean) => void;
}) {
  const reviewItems = resume ? buildReviewItems(resume) : [];
  const completedItems = reviewItems.filter((item) => item.done).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-x-hidden overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Предпросмотр резюме
          </DialogTitle>
          <DialogDescription>
            Так резюме будет выглядеть для работодателя. Проверьте содержание,
            акценты и полноту заполнения.
          </DialogDescription>
        </DialogHeader>

        {resume ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <article className="min-w-0 overflow-hidden rounded-2xl border border-[#161616]/10 bg-[#f7f7f3] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[#171717]">
                    {resume.profession || "Резюме"}
                  </h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#777]">
                    <Clock3 className="h-4 w-4" />
                    Обновлено: {formatDate(resume.updatedAt ?? resume.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-lg bg-white">
                  {resume.archived ? "Архив" : "Активное"}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {resume.city ? (
                  <Badge variant="outline" className="rounded-lg bg-white">
                    <MapPin className="h-3.5 w-3.5" />
                    {resume.city}
                  </Badge>
                ) : null}
                <Badge variant="outline" className="rounded-lg bg-white">
                  <Wallet className="h-3.5 w-3.5" />
                  {formatMoney(resume.expectedSalaryFrom, resume.expectedSalaryTo)}
                </Badge>
                {resume.employmentName ? (
                  <Badge variant="outline" className="rounded-lg bg-white">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {resume.employmentName}
                  </Badge>
                ) : null}
                {resume.workFormatName ? (
                  <Badge variant="outline" className="rounded-lg bg-white">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {resume.workFormatName}
                  </Badge>
                ) : null}
                {resume.experienceName ? (
                  <Badge variant="outline" className="rounded-lg bg-white">
                    <Clock3 className="h-3.5 w-3.5" />
                    {resume.experienceName}
                  </Badge>
                ) : null}
              </div>

              <RichTextContent
                value={resume.about}
                fallback="Описание резюме пока не заполнено."
                className="mt-4 max-w-full overflow-x-hidden break-words [&_.rich-code-frame]:max-w-full [&_pre]:max-w-full [&_table]:table-fixed [&_td]:break-words [&_th]:break-words"
              />

              {resume.skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resume.skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="outline"
                      className="max-w-full rounded-lg bg-white whitespace-normal break-words"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <ResumeExtendedDetails resume={resume} className="mt-4" />
            </article>

            <aside className="rounded-2xl border border-[#161616]/10 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-[#edf3ea] p-2 text-[#3f5f4a]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-extrabold text-[#171717]">Оценка резюме</p>
                  <p className="mt-1 text-sm text-[#626262]">
                    Заполнено {completedItems} из {reviewItems.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {reviewItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-2 rounded-xl border border-[#161616]/10 bg-[#f8f7f2] p-3 text-sm"
                  >
                    <CheckCircle2
                      className={
                        item.done ? "h-4 w-4 text-[#3f5f4a]" : "h-4 w-4 text-[#b8b2a6]"
                      }
                    />
                    <span className={item.done ? "text-[#333]" : "text-[#777]"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
