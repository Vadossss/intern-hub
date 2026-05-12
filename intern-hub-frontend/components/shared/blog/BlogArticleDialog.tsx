"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/shared/RichText";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createBlogArticle,
  type BlogArticle,
  type BlogArticlePayload,
  updateBlogArticle,
  uploadBlogImage,
} from "@/lib/api/blog";
import { resolveAssetUrl } from "@/lib/assets";

export function BlogArticleDialog({
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

      toast.success(
        article ? "Статья обновлена." : "Статья опубликована.",
      );
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
            Добавьте заголовок, изображение и текст. Публиковать статьи может
            только администратор.
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
                  onChange={(event) =>
                    void uploadCover(event.target.files?.[0])
                  }
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
