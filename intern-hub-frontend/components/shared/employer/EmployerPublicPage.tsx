"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe,
  MapPin,
} from "lucide-react";

import type { VacancyResponseDto } from "@/app/types/api";
import { RichTextContent } from "@/components/shared/RichText";
import { VacanciesSection } from "@/components/shared/VacanciesSection";
import {
  EmployerBreadcrumbs,
  EmployerPageSkeleton,
  InfoPill,
  TabButton,
} from "@/components/shared/employer/EmployerPublicPageParts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getEmployerById,
  getEmployerVacanciesById,
  type PublicEmployerProfile,
} from "@/lib/api/employers";
import { resolveAssetUrl } from "@/lib/assets";

type EmployerTab = "about" | "vacancies";

export function EmployerPublicPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employerId = String(params.id ?? "");
  const section = searchParams.get("section");

  const [employer, setEmployer] = useState<PublicEmployerProfile | null>(null);
  const [vacancies, setVacancies] = useState<VacancyResponseDto[]>([]);
  const [vacancyTotal, setVacancyTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<EmployerTab>("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextTab = getEmployerTabFromSection(section);
    setActiveTab(nextTab);

    if (!isEmployerTabSection(section)) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.set("section", "about");
      router.replace(`/employers/${employerId}?${nextParams.toString()}`, {
        scroll: false,
      });
    }
  }, [employerId, router, searchParams, section]);

  useEffect(() => {
    let active = true;

    async function loadEmployerPage() {
      try {
        setLoading(true);
        setError(null);

        const [profileResponse, vacanciesResponse] = await Promise.all([
          getEmployerById(employerId),
          getEmployerVacanciesById(employerId, 0, 50),
        ]);

        if (!active) {
          return;
        }

        setEmployer(profileResponse);
        setVacancies(vacanciesResponse.content);
        setVacancyTotal(vacanciesResponse.totalElements);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не удалось загрузить страницу работодателя.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (employerId) {
      loadEmployerPage();
    }

    return () => {
      active = false;
    };
  }, [employerId]);

  const logoUrl = useMemo(
    () => resolveAssetUrl(employer?.avatarUrl ?? employer?.logoUrl),
    [employer?.avatarUrl, employer?.logoUrl],
  );
  const companyName = employer?.companyName || "Работодатель";

  function handleTabChange(tab: EmployerTab) {
    if (activeTab === tab && section === tab) {
      return;
    }

    setActiveTab(tab);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("section", tab);
    router.push(`/employers/${employerId}?${nextParams.toString()}`, {
      scroll: false,
    });
  }

  if (loading) {
    return <EmployerPageSkeleton />;
  }

  if (error || !employer) {
    return (
      <main className="min-h-screen bg-[#f4f1e9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-extrabold text-[#171717]">
            Работодатель недоступен
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#606060]">
            {error ?? "Не удалось получить данные работодателя."}
          </p>
          <Button asChild className="mt-6 rounded-xl bg-[#171717] text-white">
            <a href="/employers">К компаниям</a>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <EmployerBreadcrumbs current={companyName} />

        <section className="overflow-hidden rounded-2xl border border-[#161616]/10 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#161616]/10 bg-[#f7f7f4] text-[#3f5f4a] sm:h-24 sm:w-24">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`Логотип ${companyName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-10 w-10" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {employer.verified ? (
                    <Badge className="rounded-full bg-[#edf3ea] px-3 py-1 text-[#3f5f4a] hover:bg-[#edf3ea]">
                      <BadgeCheck className="mr-1 h-4 w-4" />
                      Проверенный работодатель
                    </Badge>
                  ) : null}
                  <Badge
                    variant="outline"
                    className="rounded-full border-[#161616]/15 bg-white px-3 py-1 text-[#555]"
                  >
                    {vacancyTotal} вакансий
                  </Badge>
                </div>

                <h1 className="mt-4 text-3xl font-black leading-tight text-[#111] sm:text-4xl">
                  {companyName}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#555]">
                  <InfoPill icon={<MapPin className="h-4 w-4" />}>
                    {employer.city || "Город не указан"}
                  </InfoPill>
                  {employer.website ? (
                    <a
                      href={employer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#161616]/10 bg-[#f7f7f4] px-3 py-2 font-semibold text-[#3f5f4a] transition hover:border-[#3f5f4a]/30 hover:bg-[#edf3ea]"
                    >
                      <Globe className="h-4 w-4" />
                      Сайт компании
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#161616]/10 bg-white p-2 shadow-sm">
          <TabButton
            active={activeTab === "about"}
            onClick={() => handleTabChange("about")}
          >
            О компании
          </TabButton>
          <TabButton
            active={activeTab === "vacancies"}
            onClick={() => handleTabChange("vacancies")}
          >
            Вакансии
          </TabButton>
        </div>

        {activeTab === "about" ? (
          <section id="about" className="grid gap-5 lg:grid-cols-[1fr_18rem]">
            <div className="rounded-2xl border border-[#161616]/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#171717]">
                О работодателе
              </h2>
              <RichTextContent
                value={employer.about}
                fallback="Работодатель пока не добавил описание компании."
                className="mt-5 text-[15px]"
              />
            </div>

            <div className="rounded-2xl border border-[#161616]/10 bg-[#171717] p-6 text-white shadow-sm">
              <BriefcaseBusiness className="h-6 w-6 text-white/70" />
              <p className="mt-4 text-3xl font-black">{vacancyTotal}</p>
              <p className="mt-1 text-sm text-white/70">
                активных вакансий доступно у работодателя сейчас
              </p>
            </div>
          </section>
        ) : (
          <section id="vacancies">
            <VacanciesSection
              vacancies={vacancies}
              selectedDirection={null}
              title="Вакансии работодателя"
              description="Открытые позиции компании в Intern Hub."
            />
          </section>
        )}
      </div>
    </main>
  );
}

function getEmployerTabFromSection(section: string | null): EmployerTab {
  return section === "vacancies" ? "vacancies" : "about";
}

function isEmployerTabSection(section: string | null) {
  return section === "about" || section === "vacancies";
}
