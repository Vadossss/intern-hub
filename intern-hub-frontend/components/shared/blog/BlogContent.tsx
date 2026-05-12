"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteBlogArticle,
  getBlogArticles,
  type BlogArticle,
} from "@/lib/api/blog";
import { useAuth } from "@/lib/auth/context";

import { BlogArticleDialog } from "./BlogArticleDialog";
import { BlogCard } from "./BlogCard";
import { BlogGridSkeleton } from "./BlogGridSkeleton";
import { EmptyState } from "./EmptyState";
import { PAGE_SIZE } from "./constants";
import { Pagination } from "./Pagination";
import { numberParam } from "./utils";

export function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "ROLE_ADMIN";
  const filters = useMemo(
    () => ({
      query: searchParams.get("query") ?? "",
      page: numberParam(searchParams.get("page"), 0),
    }),
    [searchParams],
  );

  const [searchValue, setSearchValue] = useState(filters.query);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [pageInfo, setPageInfo] = useState({
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(
    null,
  );

  useEffect(() => {
    setSearchValue(filters.query);
  }, [filters.query]);

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);

        const response = await getBlogArticles({
          query: filters.query || undefined,
          page: filters.page,
          size: PAGE_SIZE,
        });

        if (!active) {
          return;
        }

        setArticles(response.content);
        setPageInfo({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          first: response.first,
          last: response.last,
        });
      } catch (loadError) {
        console.error("Failed to load blog articles:", loadError);

        if (!active) {
          return;
        }

        setArticles([]);
        setError("Не удалось загрузить статьи.");
        toast.error("Не удалось загрузить статьи.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadArticles();

    return () => {
      active = false;
    };
  }, [filters]);

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const query = searchValue.trim();

    if (query) {
      params.set("query", query);
      params.set("page", "0");
      router.push(`/blog?${params.toString()}`);
      return;
    }

    router.push("/blog");
  }

  function resetSearch() {
    setSearchValue("");
    router.push("/blog");
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(0, page)));
    router.push(`/blog?${params.toString()}`);
  }

  function openCreateForm() {
    setEditingArticle(null);
    setEditorOpen(true);
  }

  function openEditForm(article: BlogArticle) {
    setEditingArticle(article);
    setEditorOpen(true);
  }

  async function removeArticle(article: BlogArticle) {
    const confirmed = window.confirm(`Удалить статью "${article.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await deleteBlogArticle(article.id);
      setArticles((current) =>
        current.filter((item) => item.id !== article.id),
      );
      toast.success("Статья удалена.");
    } catch (deleteError) {
      console.error("Failed to delete blog article:", deleteError);
      toast.error("Не удалось удалить статью.");
    }
  }

  function handleSaved(article: BlogArticle) {
    setArticles((current) => {
      const exists = current.some((item) => item.id === article.id);

      if (exists) {
        return current.map((item) => (item.id === article.id ? article : item));
      }

      return [article, ...current];
    });
    setEditorOpen(false);
    setEditingArticle(null);
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#777]">
          <Link href="/" className="transition hover:text-[#171717]">
            Главная
          </Link>
          <span className="text-[#aaa]">/</span>
          <span className="text-[#171717]">Блог</span>
        </nav>

        <section className="rounded-2xl border border-[#161616]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#777]">
                Блог
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-[#111] sm:text-4xl">
                Статьи Intern Hub
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#606060]">
                Материалы о поиске работы, стажировках, резюме и найме в IT.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-[#161616]/15 bg-[#f7f7f4] px-4 py-2 text-sm font-semibold text-[#555]"
              >
                {pageInfo.totalElements} статей
              </Badge>
              {isAdmin ? (
                <Button
                  className="rounded-xl bg-[#171717] text-white"
                  onClick={openCreateForm}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Новая статья
                </Button>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={applySearch}
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-3 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="h-12 rounded-xl border-[#161616]/10 bg-white pl-11 text-sm font-medium"
                placeholder="Поиск по названию, описанию или тексту"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button className="h-12 rounded-xl bg-[#171717] px-5 text-white">
                Найти
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl bg-white px-5"
                onClick={resetSearch}
              >
                Сбросить
              </Button>
            </div>
          </form>
        </section>

        {loading ? (
          <BlogGridSkeleton />
        ) : error ? (
          <EmptyState title="Статьи недоступны" description={error} />
        ) : articles.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <BlogCard
                key={article.id}
                article={article}
                isAdmin={isAdmin}
                onEdit={openEditForm}
                onDelete={removeArticle}
              />
            ))}
          </section>
        ) : (
          <EmptyState
            title="Статей пока нет"
            description="Когда администратор опубликует материал, он появится здесь."
          />
        )}

        <Pagination
          pageNumber={pageInfo.pageNumber}
          totalPages={pageInfo.totalPages}
          first={pageInfo.first}
          last={pageInfo.last}
          onPageChange={goToPage}
        />
      </div>

      <BlogArticleDialog
        open={editorOpen}
        article={editingArticle}
        onOpenChange={setEditorOpen}
        onSaved={handleSaved}
      />
    </main>
  );
}
