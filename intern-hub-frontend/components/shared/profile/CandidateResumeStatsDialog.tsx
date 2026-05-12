"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Building2, Eye, Loader2 } from "lucide-react";

import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCandidateResumeViewStats,
  type CandidateResume,
  type CandidateResumeViewStats,
} from "@/lib/api/profile";
import { mediaUrl } from "@/components/shared/profile/utils";

const ranges = [7, 30, 90] as const;

function formatDay(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CandidateResumeStatsDialog({
  open,
  resume,
  onOpenChange,
}: {
  open: boolean;
  resume: CandidateResume | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [days, setDays] = useState<(typeof ranges)[number]>(30);
  const [stats, setStats] = useState<CandidateResumeViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resumeId = resume?.id;

    if (!open || typeof resumeId !== "number") {
      return;
    }

    let active = true;
    const currentResumeId = resumeId;

    async function loadStats() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getCandidateResumeViewStats(currentResumeId, days);

        if (active) {
          setStats(response);
        }
      } catch (loadError) {
        console.error("Failed to load resume view stats:", loadError);
        if (active) {
          setError("Не удалось загрузить статистику просмотров.");
          setStats(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      active = false;
    };
  }, [days, open, resume?.id]);

  const chartData = useMemo(
    () =>
      (stats?.chart ?? []).map((item) => ({
        date: item.date,
        label: formatDay(item.date),
        views: item.views,
      })),
    [stats?.chart],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Статистика резюме
          </DialogTitle>
          <DialogDescription>
            {resume?.profession || "Резюме"}: просмотры и компании за выбранный период.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
            <Eye className="h-3.5 w-3.5" />
            Всего просмотров: {stats?.totalViews ?? resume?.viewCount ?? 0}
          </Badge>
          <div className="flex flex-wrap gap-2">
            {ranges.map((range) => (
              <Button
                key={range}
                type="button"
                variant={days === range ? "default" : "outline"}
                size="sm"
                className={days === range ? "bg-[#171717] text-white" : ""}
                onClick={() => setDays(range)}
              >
                {range} дней
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-[#626262]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загружаем статистику
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-sm text-red-700">
              {error}
            </div>
          ) : (
            <ChartContainer
              config={{ views: { label: "Просмотры", color: "#3f5f4a" } }}
              className="h-64 w-full min-w-0"
              style={{ aspectRatio: "auto" }}
            >
              <AreaChart data={chartData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <Tooltip
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as { date?: string } | undefined;
                    return item?.date ? formatDay(item.date) : "";
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3f5f4a"
                  fill="#dfeadd"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>

        <section>
          <h3 className="text-base font-extrabold text-[#171717]">
            Компании, просмотревшие резюме
          </h3>
          <div className="mt-3 grid gap-2">
            {stats?.companies?.length ? (
              stats.companies.map((company) => {
                const avatar = mediaUrl(company.avatarUrl);
                const companyContent = (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf3ea] text-[#3f5f4a]">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={company.companyName || "Компания"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#171717]">
                        {company.companyName || "Компания"}
                      </p>
                      <p className="text-sm text-[#777]">
                        {formatDateTime(company.viewedAt)}
                      </p>
                    </div>
                  </div>
                );
                const cardClassName =
                  "flex items-center justify-between gap-3 rounded-xl border border-[#161616]/10 bg-white p-3 transition hover:border-[#3f5f4a]/40 hover:bg-[#f8f7f2]";

                return company.employerId ? (
                  <Link
                    key={`${company.employerId}-${company.viewedAt}`}
                    href={`/employers/${company.employerId}`}
                    className={cardClassName}
                  >
                    {companyContent}
                  </Link>
                ) : (
                  <div
                    key={`${company.companyName}-${company.viewedAt}`}
                    className={cardClassName}
                  >
                    {companyContent}
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[#161616]/15 bg-[#f8f7f2] p-4 text-sm text-[#626262]">
                Пока нет просмотров от работодателей.
              </div>
            )}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
