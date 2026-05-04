"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { CandidateApplicationsSection } from "@/components/profile/CandidateApplicationsSection";
import { CandidateDialog } from "@/components/profile/CandidateDialog";
import { CandidateFavoritesSection } from "@/components/profile/CandidateFavoritesSection";
import { CandidateProfileSection } from "@/components/profile/CandidateProfileSection";
import { EmployerApplicationsSection } from "@/components/profile/EmployerApplicationsSection";
import { EmployerProfileSection } from "@/components/profile/EmployerProfileSection";
import { EmployerVacanciesSection } from "@/components/profile/EmployerVacanciesSection";
import { ProfilePageSkeleton } from "@/components/profile/ProfilePageSkeleton";
import { SectionMenu } from "@/components/profile/SectionMenu";
import {
  ALL_VACANCIES_FILTER,
  PROFILE_SECTION_PARAM,
  VACANCY_FILTER_PARAM,
} from "@/components/profile/constants";
import {
  demoApplications,
  demoEmployerApplications,
  demoVacancies,
  emptyCandidate,
  emptyEmployer,
  type CandidateSection,
  type EmployerSection,
  type EmployerProfile,
  type RoleView,
} from "@/components/profile/types";
import {
  isCandidateSection,
  isEmployerSection,
  numberValue,
  profileSectionHref,
  textValue,
} from "@/components/profile/utils";
import { Badge } from "@/components/ui/badge";
import { getVacancyDictionaries, type SkillOption } from "@/lib/api/dictionaries";
import { useAuth } from "@/lib/auth/context";
import {
  type CandidateApplicationHistory,
  type CandidateFavoriteVacancy,
  type CandidateProfile,
  type CandidateProfileUpdate,
  type EmployerApplication,
  type EmployerVacancy,
  getCandidateApplications,
  getCandidateFavorites,
  getCandidateProfile,
  getCandidateProfileById,
  getEmployerVacancies,
  getEmployerVacancyApplications,
  updateCandidateProfile,
  updateEmployerApplicationStatus,
} from "@/lib/api/profile";

export function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const role: RoleView = user?.role === "ROLE_EMPLOYER" ? "employer" : "candidate";
  const [candidateSection, setCandidateSection] =
    useState<CandidateSection>("profile");
  const [employerSection, setEmployerSection] =
    useState<EmployerSection>("profile");
  const [candidate, setCandidate] = useState<CandidateProfile>(emptyCandidate);
  const [employer, setEmployer] = useState<EmployerProfile>(emptyEmployer);
  const [isCandidateEditing, setIsCandidateEditing] = useState(false);
  const [isEmployerEditing, setIsEmployerEditing] = useState(false);
  const [candidateApplications, setCandidateApplications] =
    useState<CandidateApplicationHistory[]>(demoApplications);
  const [candidateFavorites, setCandidateFavorites] = useState<
    CandidateFavoriteVacancy[]
  >([]);
  const [vacancies, setVacancies] = useState<EmployerVacancy[]>(demoVacancies);
  const [selectedVacancy, setSelectedVacancy] = useState(ALL_VACANCIES_FILTER);
  const [employerApplications, setEmployerApplications] = useState<
    EmployerApplication[]
  >(demoEmployerApplications);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(
    null,
  );
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        if (role === "candidate") {
          const [profile, history, favorites, dictionaries] = await Promise.all([
            getCandidateProfile(),
            getCandidateApplications(0, 10),
            getCandidateFavorites(0, 10),
            getVacancyDictionaries().catch(() => null),
          ]);
          if (!isMounted) return;
          setCandidate({ ...emptyCandidate, ...profile });
          setCandidateApplications(history.content);
          setCandidateFavorites(favorites.content);
          setSkillOptions(dictionaries?.skills ?? []);
          return;
        }

        const vacanciesResponse = await getEmployerVacancies(0, 20);
        if (!isMounted) return;
        const loadedVacancies = vacanciesResponse.content;
        setVacancies(loadedVacancies);
        const savedEmployer = window.localStorage.getItem(
          "intern-hub-employer-profile",
        );
        const parsedEmployer = savedEmployer
          ? ({
              ...emptyEmployer,
              ...JSON.parse(savedEmployer),
            } as EmployerProfile)
          : emptyEmployer;
        setEmployer({
          ...parsedEmployer,
          companyName:
            parsedEmployer.companyName ||
            loadedVacancies[0]?.employer?.name ||
            emptyEmployer.companyName,
        });
        if (loadedVacancies.length > 0) {
          const applicationResponses = await Promise.all(
            loadedVacancies.map((vacancy) =>
              getEmployerVacancyApplications(vacancy.publicId, 0, 50),
            ),
          );
          if (isMounted) {
            setEmployerApplications(
              applicationResponses.flatMap((response) => response.content),
            );
          }
        } else {
          setEmployerApplications([]);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (isMounted) toast.error("Не удалось получить данные профиля с сервера.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    const sectionParam = searchParams.get(PROFILE_SECTION_PARAM);
    const vacancyParam = searchParams.get(VACANCY_FILTER_PARAM);

    if (role === "candidate") {
      setCandidateSection(
        isCandidateSection(sectionParam) ? sectionParam : "profile",
      );
      return;
    }

    const nextSection = isEmployerSection(sectionParam) ? sectionParam : "profile";
    setEmployerSection(nextSection);
    setSelectedVacancy(
      nextSection === "applications"
        ? vacancyParam || ALL_VACANCIES_FILTER
        : ALL_VACANCIES_FILTER,
    );
  }, [role, searchParams]);

  const candidateName = useMemo(() => {
    const fullName = [candidate.firstName, candidate.lastName]
      .filter(Boolean)
      .join(" ");
    return fullName || candidate.email;
  }, [candidate]);

  const profileTitle = role === "candidate" ? candidateName : employer.companyName;
  const roleLabel = role === "candidate" ? "Соискатель" : "Работодатель";

  function loadApplications(publicId: string) {
    setSelectedVacancy(publicId);
    setEmployerSection("applications");
    router.push(profileSectionHref("applications", publicId), { scroll: false });
  }

  function changeCandidateSection(section: CandidateSection) {
    setCandidateSection(section);
    router.push(profileSectionHref(section), { scroll: false });
  }

  function changeEmployerSection(section: EmployerSection) {
    setEmployerSection(section);
    setSelectedVacancy(ALL_VACANCIES_FILTER);
    router.push(profileSectionHref(section), { scroll: false });
  }

  function changeEmployerApplicationFilter(publicId: string) {
    setSelectedVacancy(publicId);
    setEmployerSection("applications");
    router.push(profileSectionHref("applications", publicId), { scroll: false });
  }

  async function handleCandidateSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const skillIds = formData
      .getAll("skillIds")
      .map((item) => Number(textValue(item).trim()))
      .filter((item) => Number.isFinite(item) && item > 0);

    const payload: CandidateProfileUpdate = {
      firstName: textValue(formData.get("firstName")),
      lastName: textValue(formData.get("lastName")),
      city: textValue(formData.get("city")),
      about: textValue(formData.get("about")),
      resumeUrl: textValue(formData.get("resumeUrl")),
      portfolioUrl: textValue(formData.get("portfolioUrl")),
      preferredCity: textValue(formData.get("preferredCity")),
      preferredWorkFormat: textValue(formData.get("preferredWorkFormat")),
      preferredEmployment: textValue(formData.get("preferredEmployment")),
      expectedSalaryFrom: numberValue(formData.get("expectedSalaryFrom")),
      expectedSalaryTo: numberValue(formData.get("expectedSalaryTo")),
      openToWork: formData.get("openToWork") === "on",
      skillIds,
    };

    try {
      setIsSaving(true);
      const updated = await updateCandidateProfile(payload);
      setCandidate({ ...emptyCandidate, ...updated });
      setIsCandidateEditing(false);
      toast.success("Профиль сохранен.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Не удалось сохранить профиль. Проверьте сервер и авторизацию.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEmployerSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updated: EmployerProfile = {
      companyName: textValue(formData.get("companyName")),
      email: textValue(formData.get("email")),
      city: textValue(formData.get("city")),
      website: textValue(formData.get("website")),
      contactName: textValue(formData.get("contactName")),
      phone: textValue(formData.get("phone")),
      about: textValue(formData.get("about")),
    };

    setEmployer(updated);
    window.localStorage.setItem(
      "intern-hub-employer-profile",
      JSON.stringify(updated),
    );
    setIsEmployerEditing(false);
    toast.success("Профиль работодателя сохранен.");
  }

  async function openCandidate(candidateId: number) {
    try {
      const profile = await getCandidateProfileById(candidateId);
      setSelectedCandidate(profile);
    } catch (error) {
      console.error("Failed to load candidate:", error);
      setSelectedCandidate({
        ...emptyCandidate,
        userId: candidateId,
        email: "candidate@example.com",
        firstName: "Кандидат",
        lastName: String(candidateId),
      });
      toast.error("Профиль кандидата не загрузился с сервера.");
    } finally {
      setIsCandidateDialogOpen(true);
    }
  }

  async function changeApplicationStatus(
    applicationId: number,
    status: "ACCEPTED" | "REJECTED",
  ) {
    try {
      const updated = await updateEmployerApplicationStatus(applicationId, status);
      setEmployerApplications((items) =>
        items.map((item) =>
          item.applicationId === applicationId ? updated : item,
        ),
      );
      toast.success(status === "ACCEPTED" ? "Отклик принят." : "Отклик отклонен.");
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error("Не удалось обновить статус отклика.");
    }
  }

  if (isLoading) {
    return <ProfilePageSkeleton roleLabel={roleLabel} />;
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="space-y-4 lg:sticky">
            <div className="rounded-2xl border border-[#161616]/10 bg-white/85 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777]">
                Личный кабинет
              </p>
              <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-[#171717]">
                {profileTitle}
              </h1>
              <Badge variant="outline" className="mt-4 rounded-lg bg-[#f7f7f3]">
                {roleLabel}
              </Badge>
            </div>

            {role === "candidate" ? (
              <SectionMenu<CandidateSection>
                active={candidateSection}
                onChange={changeCandidateSection}
                items={[
                  { id: "profile", label: "Профиль" },
                  { id: "applications", label: "Отклики" },
                  { id: "favorites", label: "Избранные вакансии" },
                ]}
              />
            ) : (
              <SectionMenu<EmployerSection>
                active={employerSection}
                onChange={changeEmployerSection}
                items={[
                  { id: "profile", label: "Профиль" },
                  { id: "vacancies", label: "Вакансии" },
                  { id: "applications", label: "Отклики" },
                ]}
              />
            )}
          </div>

          <div className="min-w-0 space-y-6">
            {role === "candidate" && candidateSection === "profile" ? (
              <CandidateProfileSection
                candidate={candidate}
                candidateName={candidateName}
                skillOptions={skillOptions}
                isEditing={isCandidateEditing}
                isSaving={isSaving}
                onSubmit={handleCandidateSave}
                onEdit={() => setIsCandidateEditing(true)}
                onCancel={() => setIsCandidateEditing(false)}
              />
            ) : null}

            {role === "candidate" && candidateSection === "applications" ? (
              <CandidateApplicationsSection applications={candidateApplications} />
            ) : null}

            {role === "candidate" && candidateSection === "favorites" ? (
              <CandidateFavoritesSection favorites={candidateFavorites} />
            ) : null}

            {role === "employer" && employerSection === "profile" ? (
              <EmployerProfileSection
                employer={employer}
                vacancies={vacancies}
                applications={employerApplications}
                isEditing={isEmployerEditing}
                onEdit={() => setIsEmployerEditing(true)}
                onCancel={() => setIsEmployerEditing(false)}
                onSubmit={handleEmployerSave}
              />
            ) : null}

            {role === "employer" && employerSection === "vacancies" ? (
              <EmployerVacanciesSection
                vacancies={vacancies}
                onOpenApplications={loadApplications}
              />
            ) : null}

            {role === "employer" && employerSection === "applications" ? (
              <EmployerApplicationsSection
                applications={employerApplications}
                selectedVacancy={selectedVacancy}
                vacancies={vacancies}
                onVacancyChange={changeEmployerApplicationFilter}
                onOpenCandidate={openCandidate}
                onStatusChange={changeApplicationStatus}
              />
            ) : null}
          </div>
        </div>
      </section>

      <CandidateDialog
        candidate={selectedCandidate}
        open={isCandidateDialogOpen}
        onOpenChange={setIsCandidateDialogOpen}
      />
    </main>
  );
}
