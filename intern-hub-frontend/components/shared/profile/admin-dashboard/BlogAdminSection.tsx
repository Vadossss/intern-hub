"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { AdminHeader } from "./AdminHeader";
import { AdminPanel } from "./AdminPanel";

export function BlogAdminSection() {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Блог"
        title="Публикации и редактор"
        description="Администратор может создавать статьи, работать с текстом, изображениями, таблицами, цитатами и блоками кода."
        action={
          <Button asChild className="rounded-xl bg-[#171717] text-white">
            <Link href="/blog">Открыть блог</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminPanel title="Статьи">
          <p className="text-sm leading-6 text-[#666]">
            Создавайте и редактируйте публикации, которые отображаются в общем
            разделе блога.
          </p>
        </AdminPanel>
        <AdminPanel title="Медиа">
          <p className="text-sm leading-6 text-[#666]">
            Добавляйте изображения к статьям и используйте их внутри материала.
          </p>
        </AdminPanel>
        <AdminPanel title="Редактор">
          <p className="text-sm leading-6 text-[#666]">
            Поддерживаются заголовки, код, таблицы, цитаты и примечания.
          </p>
        </AdminPanel>
      </div>
    </section>
  );
}
