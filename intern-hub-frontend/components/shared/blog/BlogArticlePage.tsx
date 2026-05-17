"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ImageIcon,
  Newspaper,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { RichTextContent } from "@/components/shared/RichText";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogArticle, type BlogArticle } from "@/lib/api/blog";
import { resolveAssetUrl } from "@/lib/assets";

export function BlogArticlePage() {
  const params = useParams();
  const articleId = String(params.id ?? "");

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);

        const response = await getBlogArticle(articleId);

        if (active) {
          setArticle(response);
        }
      } catch (loadError) {
        console.error("Failed to load blog article:", loadError);

        if (active) {
          setError("Не удалось загрузить статью.");
          toast.error("Не удалось загрузить статью.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (articleId) {
      void loadArticle();
    }

    return () => {
      active = false;
    };
  }, [articleId]);

  if (loading) {
    return <ArticleSkeleton />;
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <Newspaper className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-[#171717]">
            Статья недоступна
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#606060]">
            {error ?? "Не удалось получить данные статьи."}
          </p>
          <Button asChild className="mt-6 rounded-xl bg-[#171717] text-white">
            <Link href="/blog">К блогу</Link>
          </Button>
        </div>
      </main>
    );
  }

  const coverUrl = resolveAssetUrl(article.coverImageUrl);

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl space-y-5">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#777]">
          <Link href="/" className="transition hover:text-[#171717]">
            Главная
          </Link>
          <span className="text-[#aaa]">/</span>
          <Link href="/blog" className="transition hover:text-[#171717]">
            Блог
          </Link>
          <span className="text-[#aaa]">/</span>
          <span className="line-clamp-1 min-w-0 text-[#171717]">
            {article.title}
          </span>
        </nav>

        <header className="overflow-hidden rounded-2xl border border-[#161616]/10 bg-white shadow-sm">
          <div className="aspect-[16/8] bg-[#f7f7f4]">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#3f5f4a]">
                <ImageIcon className="h-14 w-14" />
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-[0.12em] text-[#777]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(article.createdAt)}
              </span>
              {article.authorName ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5" />
                  {article.authorName}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-[#111] sm:text-5xl">
              {article.title}
            </h1>

            {article.summary ? (
              <p className="mt-4 text-lg leading-8 text-[#606060]">
                {article.summary}
              </p>
            ) : null}
          </div>
        </header>

        <section className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
          <RichTextContent
            value={article.content}
            className="text-[16px] leading-8 text-[#333]"
          />
        </section>
      </article>
    </main>
  );
}

function ArticleSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <Skeleton className="h-10 w-28 rounded-xl bg-[#e6e2d8]" />
        <Skeleton className="h-[28rem] rounded-2xl bg-[#e6e2d8]" />
        <Skeleton className="h-80 rounded-2xl bg-[#e6e2d8]" />
      </div>
    </main>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Без даты";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
