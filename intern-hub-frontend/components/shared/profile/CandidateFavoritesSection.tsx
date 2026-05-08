"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2, Heart } from "lucide-react";
import { toast } from "sonner";

import { statusLabel, vacancyHref } from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addCandidateFavorite,
  type CandidateFavoriteVacancy,
  removeCandidateFavorite,
} from "@/lib/api/profile";
import { cn } from "@/lib/utils";

export function CandidateFavoritesSection({
  favorites,
  favoriteState,
  onFavoriteStateChange,
}: {
  favorites: CandidateFavoriteVacancy[];
  favoriteState: Record<string, boolean>;
  onFavoriteStateChange: (publicId: string, isFavorite: boolean) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleFavorite(publicId: string) {
    const isFavorite = favoriteState[publicId] ?? true;

    try {
      setPendingId(publicId);

      if (isFavorite) {
        await removeCandidateFavorite(publicId);
        onFavoriteStateChange(publicId, false);
        toast.success("Вакансия удалена из избранного.");
        return;
      }

      await addCandidateFavorite(publicId);
      onFavoriteStateChange(publicId, true);
      toast.success("Вакансия снова добавлена в избранное.");
    } catch (error) {
      console.error("Failed to toggle favorite vacancy:", error);
      toast.error("Не удалось обновить избранное.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <CardTitle>Мои избранные вакансии</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorites.length > 0 ? (
          favorites.map((favorite) => {
            const isFavorite = favoriteState[favorite.publicId] ?? true;
            const employerId = favorite.employer?.id;

            return (
              <div
                key={favorite.publicId}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={vacancyHref(favorite.publicId)}
                      className="inline-flex items-center gap-1 break-words font-semibold text-[#171717] transition hover:text-[#48644d] hover:underline"
                    >
                      {favorite.title}
                      <ArrowUpRight className="h-4 w-4 shrink-0" />
                    </Link>

                    {employerId ? (
                      <Link
                        href={`/employers/${employerId}`}
                        className="mt-1 flex w-fit items-center gap-1 text-sm font-medium text-[#48644d] transition hover:underline"
                      >
                        <Building2 className="h-4 w-4 text-[#8a8a8a]" />
                        {favorite.employer?.companyName ??
                          "Компания не указана"}
                      </Link>
                    ) : (
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#626262]">
                        <Building2 className="h-4 w-4 text-[#8a8a8a]" />
                        {favorite.employer?.companyName ??
                          "Компания не указана"}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-lg bg-[#f7f7f3]"
                    >
                      {statusLabel(favorite.status)}
                    </Badge>
                    <button
                      type="button"
                      disabled={pendingId === favorite.publicId}
                      className={cn(
                        "rounded-full border border-[#161616]/15 bg-white p-2 text-[#8b8b8b] transition",
                        "hover:border-red-600 hover:text-red-600 disabled:cursor-wait disabled:opacity-60",
                        isFavorite && "border-red-200 text-red-600",
                      )}
                      aria-label={
                        isFavorite
                          ? "Удалить из избранного"
                          : "Добавить в избранное"
                      }
                      aria-pressed={isFavorite}
                      onClick={() => void toggleFavorite(favorite.publicId)}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5",
                          isFavorite && "fill-red-600 text-red-600",
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#626262]">
                  {favorite.city ? <span>{favorite.city}</span> : null}
                  {favorite.workFormat?.name ? (
                    <span>{favorite.workFormat.name}</span>
                  ) : null}
                  {favorite.employment?.name ? (
                    <span>{favorite.employment.name}</span>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed bg-white p-5 text-sm text-[#626262]">
            Вакансий нет.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
