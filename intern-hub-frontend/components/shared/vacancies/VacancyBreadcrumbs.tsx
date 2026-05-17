import Link from "next/link";

export function VacancyBreadcrumbs({ current }: { current?: string }) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-[#666]"
    >
      <Link href="/" className="transition hover:text-[#171717]">
        Главная
      </Link>
      <span className="text-[#aaa]">/</span>
      {current ? (
        <Link href="/vacancies" className="transition hover:text-[#171717]">
          Вакансии
        </Link>
      ) : (
        <span className="text-[#171717]">Вакансии</span>
      )}
      {current ? (
        <>
          <span className="text-[#aaa]">/</span>
          <span className="max-w-[18rem] truncate text-[#171717] sm:max-w-[34rem]">
            {current}
          </span>
        </>
      ) : null}
    </nav>
  );
}
