"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { CandidateApplicationsSection } from "@/components/shared/profile/CandidateApplicationsSection";
import { CandidateDialog } from "@/components/shared/profile/CandidateDialog";
import { CandidateFavoritesSection } from "@/components/shared/profile/CandidateFavoritesSection";
import { CandidateProfileSection } from "@/components/shared/profile/CandidateProfileSection";
import { CandidateResumesSection } from "@/components/shared/profile/CandidateResumesSection";
import { AccountSettingsSection } from "@/components/shared/profile/AccountSettingsSection";
import { EmployerApplicationsSection } from "@/components/shared/profile/EmployerApplicationsSection";
import { EmployerCandidatesSection } from "@/components/shared/profile/EmployerCandidatesSection";
import { EmployerProfileSection } from "@/components/shared/profile/EmployerProfileSection";
import { EmployerVacanciesSection } from "@/components/shared/profile/EmployerVacanciesSection";
import { ProfilePageSkeleton } from "@/components/shared/profile/ProfilePageSkeleton";
import { SectionMenu } from "@/components/shared/profile/SectionMenu";
import {
  ALL_VACANCIES_FILTER,
  PROFILE_SECTION_PARAM,
  VACANCY_FILTER_PARAM,
} from "@/components/shared/profile/constants";
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
} from "@/components/shared/profile/types";
import {
  isCandidateSection,
  isEmployerSection,
  profileSectionHref,
  textValue,
} from "@/components/shared/profile/utils";
import { Badge } from "@/components/ui/badge";
import {
  getVacancyDictionaries,
  type SkillOption,
  type VacancyDictionaries,
} from "@/lib/api/dictionaries";
import { useAuth } from "@/lib/auth/context";
import { ApiError } from "@/lib/api/client";
import {
  changeEmail,
  requestPasswordReset,
  resendEmailVerification,
} from "@/lib/api/auth";
import {
  type CandidateApplicationHistory,
  type CandidateFavoriteVacancy,
  type CandidateProfile,
  type CandidateProfileUpdate,
  type CandidateResume,
  type CandidateResumePayload,
  type EmployerApplication,
  type EmployerVacancy,
  archiveCandidateResume,
  createCandidateResume,
  deleteCandidateResume,
  getCandidateApplications,
  getCandidateFavorites,
  getCandidateProfile,
  getCandidateProfileById,
  getCandidateResumes,
  getEmployerProfile,
  getEmployerVacancies,
  getEmployerVacancyApplications,
  uploadCandidateProfilePhoto,
  uploadEmployerProfilePhoto,
  restoreCandidateResume,
  updateCandidateResume,
  updateCandidateProfile,
  updateEmployerProfile,
  updateEmployerApplicationStatus,
} from "@/lib/api/profile";
import { Bookmark, FileText, Search, Send, Settings, User } from "lucide-react";

export function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const role: RoleView =
    user?.role === "ROLE_EMPLOYER" ? "employer" : "candidate";
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
  const [candidateResumes, setCandidateResumes] = useState<CandidateResume[]>(
    [],
  );
  const [candidateFavorites, setCandidateFavorites] = useState<
    CandidateFavoriteVacancy[]
  >([]);
  const [candidateFavoriteState, setCandidateFavoriteState] = useState<
    Record<string, boolean>
  >({});
  const [vacancies, setVacancies] = useState<EmployerVacancy[]>(demoVacancies);
  const [selectedVacancy, setSelectedVacancy] = useState(ALL_VACANCIES_FILTER);
  const [employerApplications, setEmployerApplications] = useState<
    EmployerApplication[]
  >(demoEmployerApplications);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateProfile | null>(null);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResumeSaving, setIsResumeSaving] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [dictionaries, setDictionaries] = useState<VacancyDictionaries | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        if (role === "candidate") {
          const [profile, resumes, history, favorites, loadedDictionaries] =
            await Promise.all([
              getCandidateProfile(),
              getCandidateResumes(),
              getCandidateApplications(0, 10),
              getCandidateFavorites(0, 10),
              getVacancyDictionaries().catch(() => null),
            ]);
          if (!isMounted) return;
          setCandidate({ ...emptyCandidate, ...profile, resumes });
          setCandidateResumes(resumes);
          setCandidateApplications(history.content);
          setCandidateFavorites(favorites.content);
          setCandidateFavoriteState((current) => {
            const next = { ...current };

            favorites.content.forEach((favorite) => {
              if (next[favorite.publicId] === undefined) {
                next[favorite.publicId] = true;
              }
            });

            return next;
          });
          setDictionaries(loadedDictionaries);
          setSkillOptions(loadedDictionaries?.skills ?? []);
          return;
        }

        const [employerProfile, vacanciesResponse, loadedDictionaries] =
          await Promise.all([
            getEmployerProfile(),
            getEmployerVacancies(0, 20),
            getVacancyDictionaries().catch(() => null),
          ]);
        if (!isMounted) return;
        const loadedVacancies = vacanciesResponse.content;
        setVacancies(loadedVacancies);
        setDictionaries(loadedDictionaries);
        setSkillOptions(loadedDictionaries?.skills ?? []);
        setEmployer({
          ...emptyEmployer,
          ...employerProfile,
          companyName:
            employerProfile.companyName ||
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
        if (isMounted && !isAuthError(error))
          toast.error("Не удалось получить данные профиля с сервера.");
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

    const nextSection = isEmployerSection(sectionParam)
      ? sectionParam
      : "profile";
    setEmployerSection(nextSection);
    setSelectedVacancy(
      nextSection === "applications"
        ? vacancyParam || ALL_VACANCIES_FILTER
        : ALL_VACANCIES_FILTER,
    );
  }, [role, searchParams]);

  const profileTitle =
    role === "candidate" ? candidate.email : employer.companyName;
  const roleLabel = role === "candidate" ? "Соискатель" : "Работодатель";

  function loadApplications(publicId: string) {
    setSelectedVacancy(publicId);
    setEmployerSection("applications");
    router.push(profileSectionHref("applications", publicId), {
      scroll: false,
    });
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
    router.push(profileSectionHref("applications", publicId), {
      scroll: false,
    });
  }

  function changeCandidateFavoriteState(
    publicId: string,
    isFavorite: boolean,
  ) {
    setCandidateFavoriteState((current) => ({
      ...current,
      [publicId]: isFavorite,
    }));
  }

  async function handleCandidateSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload: CandidateProfileUpdate = {
      firstName: textValue(formData.get("firstName")).trim(),
      lastName: textValue(formData.get("lastName")).trim(),
      birthday: textValue(formData.get("birthday")) || undefined,
      phoneNumber: textValue(formData.get("phoneNumber")).trim(),
      openToWork: formData.get("openToWork") === "on",
    };

    try {
      setIsSaving(true);
      const updated = await updateCandidateProfile(payload);
      setCandidate({ ...emptyCandidate, ...updated });
      setIsCandidateEditing(false);
      toast.success("Профиль сохранен.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(
        "Не удалось сохранить профиль. Проверьте сервер и авторизацию.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCandidatePhotoUpload(file: File) {
    try {
      const updated = await uploadCandidateProfilePhoto(file);
      setCandidate({ ...emptyCandidate, ...updated });
      toast.success("Фото профиля обновлено.");
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
      toast.error("Не удалось загрузить фото профиля.");
    }
  }

  async function handleCreateResume(payload: CandidateResumePayload) {
    try {
      setIsResumeSaving(true);
      const created = await createCandidateResume(payload);
      setCandidateResumes((items) => [...items, created]);
      setCandidate((current) => ({
        ...current,
        resumes: [...(current.resumes ?? []), created],
      }));
      toast.success("Резюме создано.");
      return created;
    } catch (error) {
      console.error("Failed to create resume:", error);
      toast.error("Не удалось создать резюме.");
      throw error;
    } finally {
      setIsResumeSaving(false);
    }
  }

  async function handleUpdateResume(
    resumeId: number,
    payload: CandidateResumePayload,
  ) {
    try {
      setIsResumeSaving(true);
      const updated = await updateCandidateResume(resumeId, payload);
      setCandidateResumes((items) =>
        items.map((item) => (item.id === resumeId ? updated : item)),
      );
      setCandidate((current) => ({
        ...current,
        resumes: (current.resumes ?? []).map((item) =>
          item.id === resumeId ? updated : item,
        ),
      }));
      toast.success("Резюме сохранено.");
      return updated;
    } catch (error) {
      console.error("Failed to update resume:", error);
      toast.error("Не удалось сохранить резюме.");
      throw error;
    } finally {
      setIsResumeSaving(false);
    }
  }

  async function handleArchiveResume(resumeId: number) {
    try {
      setIsResumeSaving(true);
      const updated = await archiveCandidateResume(resumeId);
      replaceResume(updated);
      toast.success("Резюме перенесено в архив.");
      return updated;
    } catch (error) {
      console.error("Failed to archive resume:", error);
      toast.error("Не удалось архивировать резюме.");
      throw error;
    } finally {
      setIsResumeSaving(false);
    }
  }

  async function handleRestoreResume(resumeId: number) {
    try {
      setIsResumeSaving(true);
      const updated = await restoreCandidateResume(resumeId);
      replaceResume(updated);
      toast.success("Резюме снова активно.");
      return updated;
    } catch (error) {
      console.error("Failed to restore resume:", error);
      toast.error("Не удалось вернуть резюме из архива.");
      throw error;
    } finally {
      setIsResumeSaving(false);
    }
  }

  async function handleDeleteResume(resumeId: number) {
    try {
      setIsResumeSaving(true);
      await deleteCandidateResume(resumeId);
      setCandidateResumes((items) => items.filter((item) => item.id !== resumeId));
      setCandidate((current) => ({
        ...current,
        resumes: (current.resumes ?? []).filter((item) => item.id !== resumeId),
      }));
      toast.success("Резюме удалено.");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Не удалось удалить резюме.");
      throw error;
    } finally {
      setIsResumeSaving(false);
    }
  }

  function replaceResume(updated: CandidateResume) {
    setCandidateResumes((items) =>
      items.map((item) => (item.id === updated.id ? updated : item)),
    );
    setCandidate((current) => ({
      ...current,
      resumes: (current.resumes ?? []).map((item) =>
        item.id === updated.id ? updated : item,
      ),
    }));
  }

  async function handleEmployerSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updated: EmployerProfile = {
      companyName: textValue(formData.get("companyName")),
      city: textValue(formData.get("city")),
      website: textValue(formData.get("website")),
      contactName: textValue(formData.get("contactName")),
      phone: textValue(formData.get("phone")),
      about: textValue(formData.get("about")),
    };

    try {
      setIsSaving(true);
      const saved = await updateEmployerProfile(updated);
      setEmployer({ ...emptyEmployer, ...saved });
      setIsEmployerEditing(false);
      toast.success("Профиль работодателя сохранен.");
    } catch (error) {
      console.error("Failed to update employer profile:", error);
      toast.error("Не удалось сохранить профиль работодателя.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEmployerPhotoUpload(file: File) {
    try {
      const updated = await uploadEmployerProfilePhoto(file);
      setEmployer({ ...emptyEmployer, ...updated });
      toast.success("Фото компании обновлено.");
    } catch (error) {
      console.error("Failed to upload employer photo:", error);
      toast.error("Не удалось загрузить фото компании.");
    }
  }

  async function handleResendVerification() {
    if (!user?.email) return;

    try {
      setIsSettingsSaving(true);
      await resendEmailVerification(user.email);
      toast.success("Письмо подтверждения отправлено.");
    } catch (error) {
      console.error("Failed to resend email verification:", error);
      toast.error("Не удалось отправить письмо подтверждения.");
    } finally {
      setIsSettingsSaving(false);
    }
  }

  async function handlePasswordResetRequest() {
    if (!user?.email) return;

    try {
      setIsSettingsSaving(true);
      await requestPasswordReset(user.email);
      toast.success("Письмо для смены пароля отправлено.");
    } catch (error) {
      console.error("Failed to request password reset:", error);
      toast.error("Не удалось отправить письмо для смены пароля.");
    } finally {
      setIsSettingsSaving(false);
    }
  }

  async function handleEmailChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = textValue(formData.get("email")).trim();

    if (!email) {
      toast.error("Укажите новую почту.");
      return;
    }

    if (email === user?.email) {
      toast.message("Эта почта уже указана в аккаунте.");
      return;
    }

    try {
      setIsSettingsSaving(true);
      const updatedUser = await changeEmail(email);
      setUser(updatedUser);

      if (role === "candidate") {
        setCandidate((current) => ({ ...current, email: updatedUser.email }));
      } else {
        setEmployer((current) => ({ ...current, email: updatedUser.email }));
      }

      toast.success("Почта обновлена. Мы отправили письмо подтверждения.");
    } catch (error) {
      console.error("Failed to change email:", error);
      toast.error("Не удалось изменить почту.");
    } finally {
      setIsSettingsSaving(false);
    }
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
      const updated = await updateEmployerApplicationStatus(
        applicationId,
        status,
      );
      setEmployerApplications((items) =>
        items.map((item) =>
          item.applicationId === applicationId ? updated : item,
        ),
      );
      toast.success(
        status === "ACCEPTED" ? "Отклик принят." : "Отклик отклонен.",
      );
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
              {user && user.verified === false ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <p className="font-semibold">Почта не подтверждена</p>
                  <button
                    type="button"
                    className="mt-2 text-sm font-semibold text-amber-900 underline"
                    onClick={handleResendVerification}
                  >
                    Отправить письмо ещё раз
                  </button>
                </div>
              ) : null}
            </div>

            {role === "candidate" ? (
              <SectionMenu<CandidateSection>
                active={candidateSection}
                onChange={changeCandidateSection}
                items={[
                  { id: "profile", label: "Профиль", icon: <User /> },
                  { id: "resumes", label: "Резюме", icon: <FileText /> },
                  { id: "applications", label: "Отклики", icon: <Send /> },
                  {
                    id: "favorites",
                    label: "Избранные вакансии",
                    icon: <Bookmark />,
                  },
                  ...(user
                    ? [
                        {
                          id: "settings",
                          label: "Настройки",
                          icon: <Settings />,
                        } as const,
                      ]
                    : []),
                ]}
              />
            ) : (
              <SectionMenu<EmployerSection>
                active={employerSection}
                onChange={changeEmployerSection}
                items={[
                  { id: "profile", label: "Профиль", icon: <User /> },
                  { id: "candidates", label: "Соискатели", icon: <Search /> },
                  { id: "vacancies", label: "Вакансии", icon: <Send /> },
                  { id: "applications", label: "Отклики", icon: <Bookmark /> },
                  ...(user
                    ? [
                        {
                          id: "settings",
                          label: "Настройки",
                          icon: <Settings />,
                        } as const,
                      ]
                    : []),
                ]}
              />
            )}
          </div>

          <div className="min-w-0 space-y-6">
            {role === "candidate" && candidateSection === "profile" ? (
              <CandidateProfileSection
                candidate={candidate}
                isEditing={isCandidateEditing}
                isSaving={isSaving}
                onSubmit={handleCandidateSave}
                onPhotoUpload={handleCandidatePhotoUpload}
                onEdit={() => setIsCandidateEditing(true)}
                onCancel={() => setIsCandidateEditing(false)}
              />
            ) : null}

            {role === "candidate" && candidateSection === "resumes" ? (
              <CandidateResumesSection
                resumes={candidateResumes}
                dictionaries={dictionaries}
                isSaving={isResumeSaving}
                onCreate={handleCreateResume}
                onUpdate={handleUpdateResume}
                onArchive={handleArchiveResume}
                onRestore={handleRestoreResume}
                onDelete={handleDeleteResume}
              />
            ) : null}

            {role === "candidate" && candidateSection === "applications" ? (
              <CandidateApplicationsSection
                applications={candidateApplications}
              />
            ) : null}

            {role === "candidate" && candidateSection === "favorites" ? (
              <CandidateFavoritesSection
                favorites={candidateFavorites}
                favoriteState={candidateFavoriteState}
                onFavoriteStateChange={changeCandidateFavoriteState}
              />
            ) : null}

            {user && role === "candidate" && candidateSection === "settings" ? (
              <AccountSettingsSection
                user={user}
                isSaving={isSettingsSaving}
                onEmailChange={handleEmailChange}
                onPasswordResetRequest={handlePasswordResetRequest}
                onResendVerification={handleResendVerification}
              />
            ) : null}

            {role === "employer" && employerSection === "profile" ? (
              <EmployerProfileSection
                employer={employer}
                vacancies={vacancies}
                applications={employerApplications}
                isEditing={isEmployerEditing}
                isSaving={isSaving}
                onEdit={() => setIsEmployerEditing(true)}
                onCancel={() => setIsEmployerEditing(false)}
                onSubmit={handleEmployerSave}
                onPhotoUpload={handleEmployerPhotoUpload}
              />
            ) : null}

            {role === "employer" && employerSection === "vacancies" ? (
              <EmployerVacanciesSection
                vacancies={vacancies}
                onOpenApplications={loadApplications}
              />
            ) : null}

            {role === "employer" && employerSection === "candidates" ? (
              <EmployerCandidatesSection
                skillOptions={skillOptions}
                onOpenCandidate={openCandidate}
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

            {user && role === "employer" && employerSection === "settings" ? (
              <AccountSettingsSection
                user={user}
                isSaving={isSettingsSaving}
                onEmailChange={handleEmailChange}
                onPasswordResetRequest={handlePasswordResetRequest}
                onResendVerification={handleResendVerification}
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

function isAuthError(error: unknown) {
  return (
    error instanceof ApiError && (error.status === 401 || error.status === 403)
  );
}
