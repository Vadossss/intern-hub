"use client";

import { BookOpen, FileWarning, Shield, UserCog } from "lucide-react";

import { profileSectionHref } from "../utils";
import { AdminHeader } from "./AdminHeader";
import { AdminMetricCard } from "./AdminMetricCard";
import { AdminWorkflowStep } from "./AdminWorkflowStep";

export function AdminOverviewSection({
  activeExcludedWords,
  excludedWordsTotal,
  pendingVacanciesTotal,
}: {
  activeExcludedWords: number;
  excludedWordsTotal: number;
  pendingVacanciesTotal: number;
}) {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Кабинет администратора"
        title="Панель управления платформой"
        description="Все административные инструменты вынесены в отдельные разделы: модерация вакансий, правила агрегации, пользователи и блог."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          href={profileSectionHref("vacancies")}
          icon={<FileWarning className="h-5 w-5" />}
          label="На проверке"
          value={String(pendingVacanciesTotal)}
          detail="Вакансии ожидают решения администратора"
        />
        <AdminMetricCard
          href={profileSectionHref("excluded-words")}
          icon={<Shield className="h-5 w-5" />}
          label="Стоп-слова"
          value={String(excludedWordsTotal)}
          detail={`${activeExcludedWords} активных правил фильтрации`}
        />
        <AdminMetricCard
          href={profileSectionHref("users")}
          icon={<UserCog className="h-5 w-5" />}
          label="Пользователи"
          value="Роли"
          detail="Смена ролей, блокировка и разблокировка"
        />
        <AdminMetricCard
          href={profileSectionHref("blog")}
          icon={<BookOpen className="h-5 w-5" />}
          label="Блог"
          value="Статьи"
          detail="Публикации, изображения и редактор"
        />
      </div>

      <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-[#171717]">
          Рабочий порядок
        </h3>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <AdminWorkflowStep
            title="1. Проверить вакансии"
            text="Откройте очередь модерации, посмотрите компанию, статус и карточку вакансии."
          />
          <AdminWorkflowStep
            title="2. Обновить правила"
            text="Пополните стоп-слова, если агрегация начала пропускать нерелевантные вакансии."
          />
          <AdminWorkflowStep
            title="3. Управлять доступом"
            text="При необходимости смените роль пользователя или временно заблокируйте аккаунт."
          />
        </div>
      </div>
    </section>
  );
}
