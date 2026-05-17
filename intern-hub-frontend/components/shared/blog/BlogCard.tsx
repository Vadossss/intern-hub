"use client";

import Link from "next/link";
import { CalendarDays, Edit3, Newspaper, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BlogArticle } from "@/lib/api/blog";
import { resolveAssetUrl } from "@/lib/assets";

import { formatDate } from "./utils";

export function BlogCard({
  article,
  isAdmin,
  onEdit,
  onDelete,
}: {
  article: BlogArticle;
  isAdmin: boolean;
  onEdit: (article: BlogArticle) => void;
  onDelete: (article: BlogArticle) => void;
}) {
  const coverUrl = resolveAssetUrl(article.coverImageUrl);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#161616]/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#3f5f4a]/30 hover:shadow-[0_14px_36px_rgba(20,20,20,0.08)]">
      <Link href={`/blog/${article.id}`} className="flex h-full flex-col">
        <div className="aspect-[16/9] bg-[#f7f7f4]">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={article.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#3f5f4a]">
              <Newspaper className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#777]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(article.createdAt)}
            </span>
          </div>

          <h2 className="mt-3 line-clamp-3 text-2xl font-black leading-tight text-[#111] transition group-hover:text-[#3f5f4a]">
            {article.title}
          </h2>
        </div>
      </Link>

      {isAdmin ? (
        <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl bg-white"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onEdit(article);
            }}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Изменить
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-red-200 bg-white text-red-700 hover:text-red-700"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(article);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </Button>
        </div>
      ) : null}
    </article>
  );
}
