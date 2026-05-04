import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { InfoCard } from "@/components/profile/InfoCard";
import { formatMoney } from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CandidateProfile } from "@/lib/api/profile";

export function CandidateDialog({
  candidate,
  open,
  onOpenChange,
}: {
  candidate: CandidateProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Профиль кандидата</DialogTitle>
        </DialogHeader>
        {candidate ? (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-bold">
                {[candidate.firstName, candidate.lastName]
                  .filter(Boolean)
                  .join(" ") || candidate.email}
              </h2>
              <p className="mt-1 text-sm text-[#626262]">{candidate.email}</p>
            </div>
            <p className="text-sm leading-7 text-[#4d4d4d]">{candidate.about}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Город" value={candidate.city || "Не указан"} />
              <InfoCard
                title="Ожидания"
                value={formatMoney(
                  candidate.expectedSalaryFrom,
                  candidate.expectedSalaryTo,
                )}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills ?? []).map((skill) => (
                <Badge
                  key={skill.id}
                  variant="outline"
                  className="rounded-lg bg-white"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.resumeUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.resumeUrl} target="_blank">
                    Резюме
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {candidate.portfolioUrl ? (
                <Button asChild variant="outline">
                  <Link href={candidate.portfolioUrl} target="_blank">
                    Портфолио
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
