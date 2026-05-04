import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

import {
  employerHref,
  formatDate,
  statusLabel,
  vacancyHref,
} from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateApplicationHistory } from "@/lib/api/profile";

export function CandidateApplicationsSection({
  applications,
}: {
  applications: CandidateApplicationHistory[];
}) {
  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <CardTitle>Мои отклики</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {applications.length > 0 ? (
          applications.map((application) => (
            <div
              key={application.applicationId}
              className="rounded-2xl border bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#171717]">
                    {application.vacancyTitle}
                  </p>
                  <p className="mt-1 text-sm text-[#626262]">
                    {application.companyName}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {statusLabel(application.status)}
                </Badge>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-[#777]">
                <Clock3 className="h-4 w-4" />
                Отклик от {formatDate(application.appliedAt)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={vacancyHref(application.vacancyPublicId)}>
                    Вакансия
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={employerHref(application.companyName)}>
                    Работодатель
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
            Откликов пока нет.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
