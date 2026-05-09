"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImageIcon,
  Newspaper,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { RichTextContent, RichTextEditor } from "@/components/shared/RichText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createBlogArticle,
  deleteBlogArticle,
  getBlogArticles,
  type BlogArticle,
  type BlogArticlePayload,
  updateBlogArticle,
  uploadBlogImage,
} from "@/lib/api/blog";
import { resolveAssetUrl } from "@/lib/assets";
import { useAuth } from "@/lib/auth/context";

const PAGE_SIZE = 9;

export function BlogPage() {
  return (
    <Suspense fallback={<BlogPageSkeleton />}>
      <BlogContent />
    </Suspense>
  );
}

function BlogContent() {
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
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);

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
      setArticles((current) => current.filter((item) => item.id !== article.id));
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
      <div className="mx-auto max-w-7xl space-y-6">
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

function BlogCard({
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
          {isAdmin ? (
            <>
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
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function BlogArticleDialog({
  open,
  article,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  article: BlogArticle | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (article: BlogArticle) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(article?.title ?? "");
    setSummary(article?.summary ?? "");
    setContent(article?.content ?? "");
    setCoverImageUrl(article?.coverImageUrl ?? "");
  }, [article, open]);

  async function uploadCover(file?: File) {
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const response = await uploadBlogImage(file);
      setCoverImageUrl(response.url);
      toast.success("Изображение загружено.");
    } catch (uploadError) {
      console.error("Failed to upload blog image:", uploadError);
      toast.error("Не удалось загрузить изображение.");
    } finally {
      setUploading(false);
    }
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: BlogArticlePayload = {
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || null,
      published: true,
    };

    if (!payload.title) {
      toast.error("Укажите название статьи.");
      return;
    }

    if (!payload.content) {
      toast.error("Добавьте текст статьи.");
      return;
    }

    try {
      setSaving(true);
      const saved = article
        ? await updateBlogArticle(article.id, payload)
        : await createBlogArticle(payload);

      toast.success(article ? "Статья обновлена." : "Статья опубликована.");
      onSaved(saved);
    } catch (saveError) {
      console.error("Failed to save blog article:", saveError);
      toast.error("Не удалось сохранить статью.");
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = resolveAssetUrl(coverImageUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {article ? "Редактирование статьи" : "Новая статья"}
          </DialogTitle>
          <DialogDescription>
            Добавьте заголовок, изображение и текст. Публиковать статьи может только администратор.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={saveArticle} className="space-y-4">
          <label className="grid gap-1 text-sm font-semibold text-[#333]">
            Название
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-xl"
              placeholder="Например, как подготовиться к первой стажировке"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-[#333]">
            Краткое описание
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="min-h-24 rounded-xl border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Короткий текст для карточки статьи"
            />
          </label>

          <div className="grid gap-2 text-sm font-semibold text-[#333]">
            Изображение
            <div className="grid gap-3 rounded-2xl border border-[#161616]/10 bg-[#f8f7f2] p-3 sm:grid-cols-[12rem_1fr]">
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl bg-white text-[#777]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Обложка статьи"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={coverImageUrl}
                  onChange={(event) => setCoverImageUrl(event.target.value)}
                  className="rounded-xl bg-white"
                  placeholder="/uploads/blog/images/image.jpg"
                />
                <Input
                  type="file"
                  accept="image/*"
                  className="rounded-xl bg-white"
                  disabled={uploading}
                  onChange={(event) => void uploadCover(event.target.files?.[0])}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-1 text-sm font-semibold text-[#333]">
            Текст статьи
            <RichTextEditor
              key={`${article?.id ?? "new"}-${open ? "open" : "closed"}`}
              name="content"
              defaultValue={article?.content ?? ""}
              placeholder="Напишите текст статьи..."
              onChange={setContent}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              className="rounded-xl bg-[#171717] text-white"
              disabled={saving || uploading}
            >
              {saving ? "Сохранение..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BlogGridSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#161616]/10 bg-white"
        >
          <Skeleton className="aspect-[16/9] rounded-none bg-[#e6e2d8]" />
          <div className="space-y-4 p-5">
            <Skeleton className="h-4 w-1/2 rounded-full bg-[#e6e2d8]" />
            <Skeleton className="h-7 w-4/5 rounded-full bg-[#e6e2d8]" />
            <Skeleton className="h-16 rounded-xl bg-[#e6e2d8]" />
            <Skeleton className="h-10 w-28 rounded-xl bg-[#e6e2d8]" />
          </div>
        </div>
      ))}
    </section>
  );
}

function BlogPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-36 rounded-xl bg-[#e6e2d8]" />
        <Skeleton className="h-56 rounded-2xl bg-[#e6e2d8]" />
        <BlogGridSkeleton />
      </div>
    </main>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-[#161616]/15 bg-white/70 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ea] text-[#3f5f4a]">
        <Newspaper className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black text-[#171717]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#606060]">
        {description}
      </p>
    </section>
  );
}

function Pagination({
  pageNumber,
  totalPages,
  first,
  last,
  onPageChange,
}: {
  pageNumber: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index).filter(
    (page) =>
      Math.abs(page - pageNumber) <= 2 ||
      page === 0 ||
      page === totalPages - 1,
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#161616]/10 bg-white/75 p-3">
      <Button
        type="button"
        variant="outline"
        className="rounded-xl bg-white"
        disabled={first}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Button>

      {pages.map((page, index) => {
        const previous = pages[index - 1];
        const needsGap = previous !== undefined && page - previous > 1;

        return (
          <span key={page} className="inline-flex items-center gap-2">
            {needsGap ? <span className="text-[#777]">...</span> : null}
            <Button
              type="button"
              variant={page === pageNumber ? "default" : "outline"}
              className={
                page === pageNumber
                  ? "rounded-xl bg-[#171717] text-white"
                  : "rounded-xl bg-white"
              }
              onClick={() => onPageChange(page)}
            >
              {page + 1}
            </Button>
          </span>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="rounded-xl bg-white"
        disabled={last}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Далее
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
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
