import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { employerHref, statusLabel, vacancyHref } from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidateFavoriteVacancy } from "@/lib/api/profile";

export function CandidateFavoritesSection({
  favorites,
}: {
  favorites: CandidateFavoriteVacancy[];
}) {
  return (
    <Card className="rounded-2xl border-[#161616]/10 bg-white/90">
      <CardHeader>
        <CardTitle>Мои отклики</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <div
              key={favorite.publicId}
              className="rounded-2xl border bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-[#171717]">{favorite.title}</p>
                  <p className="mt-1 text-sm text-[#626262]">
                    {favorite.employer?.companyName}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-lg bg-[#f7f7f3]">
                  {statusLabel(favorite.status)}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={vacancyHref(favorite.publicId)}>
                    Вакансия
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={employerHref(favorite.employer?.companyName)}>
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
