"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { VacancyResponseDto } from "@/app/types/api";
import { Direction } from "@/components/shared/DirectionSelector";
import { VacancyCardNew } from "@/components/shared/VacancyCardNew";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  addCandidateFavorite,
  getCandidateFavorites,
  removeCandidateFavorite,
} from "@/lib/api/profile";
import { useAuth } from "@/lib/auth/context";

interface Props {
  vacancies: VacancyResponseDto[];
  selectedDirection: Direction | null;
  className?: string;
  title?: string;
  description?: string;
}

export const VacanciesSection: React.FC<Props> = ({
  vacancies,
  selectedDirection,
  className,
  title = "Вакансии",
  description = "Подборка актуальных предложений по выбранному стеку.",
}) => {
  const { isAuthenticated, user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      if (!isAuthenticated || user?.role !== "ROLE_USER") {
        setFavoriteIds(new Set());
        setIsFavoritesLoaded(true);
        return;
      }

      try {
        setIsFavoritesLoaded(false);
        const response = await getCandidateFavorites(0, 1000);

        if (isMounted) {
          setFavoriteIds(
            new Set(response.content.map((favorite) => favorite.publicId)),
          );
        }
      } catch (error) {
        console.error("Failed to load favorite vacancies:", error);
      } finally {
        if (isMounted) {
          setIsFavoritesLoaded(true);
        }
      }
    }

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.role]);

  async function toggleFavorite(publicId: string) {
    if (!isAuthenticated) {
      toast.error("Войдите в аккаунт, чтобы добавлять вакансии в избранное.");
      return;
    }

    if (user?.role !== "ROLE_USER") {
      toast.error("Избранное доступно только соискателям.");
      return;
    }

    const isFavorite = favoriteIds.has(publicId);

    try {
      if (isFavorite) {
        await removeCandidateFavorite(publicId);
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(publicId);
          return next;
        });
        toast.success("Вакансия удалена из избранного.");
        return;
      }

      await addCandidateFavorite(publicId);
      setFavoriteIds((current) => new Set(current).add(publicId));
      toast.success("Вакансия добавлена в избранное.");
    } catch (error) {
      console.error("Failed to toggle favorite vacancy:", error);
      toast.error("Не удалось обновить избранное.");
    }
  }

  if (vacancies.length === 0) {
    return (
      <section className={className}>
        <div className="rounded-[2rem] border border-[#161616]/10 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#efeee8] text-[#6b6b6b]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold text-[#171717]">
            Вакансии не найдены
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-[#5a5a5a]">
            {selectedDirection
              ? "Для выбранного направления сейчас нет предложений. Попробуйте другой стек или вернитесь позже."
              : "Сейчас доступных вакансий нет. Попробуйте обновить страницу чуть позже."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="rounded-[2rem] border border-[#161616]/10 bg-white/70 p-5 shadow-[0_12px_40px_rgba(20,20,20,0.08)] backdrop-blur sm:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold uppercase tracking-tight text-[#171717]">
                {title}
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-[#5a5a5a]">{description}</p>
          </div>

          {/* <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-[#161616]/15 bg-white px-4 py-2 text-sm text-[#3f3f3f]"
            >
              Найдено: {vacancies.length}
            </Badge>
            <Button
              variant="outline"
              className="rounded-full border-[#161616]/15 bg-white hover:bg-[#f8f8f8]"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Сортировка
            </Button>
          </div> */}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {vacancies.map((vacancy) => (
            <VacancyCardNew
              key={vacancy.id}
              vacancy={vacancy}
              isFavorite={
                isFavoritesLoaded ? favoriteIds.has(vacancy.publicId) : false
              }
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
