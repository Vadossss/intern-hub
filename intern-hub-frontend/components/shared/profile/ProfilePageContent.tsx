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
import { AdminDashboardSection } from "@/components/shared/profile/admin-dashboard";
import { EmployerApplicationsSection } from "@/components/shared/profile/EmployerApplicationsSection";
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
  type AdminSection,
  type CandidateSection,
  type EmployerSection,
  type EmployerProfile,
  type RoleView,
} from "@/components/shared/profile/types";
import {
  isAdminSection,
  isCandidateSection,
  isEmployerSection,
  profileSectionHref,
  textValue,
} from "@/components/shared/profile/utils";
import {
  getVacancyFormDictionaries,
  type VacancyFormDictionaries,
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
  type VacancyPayload,
  archiveCandidateResume,
  archiveVacancy,
  createCandidateResume,
  createVacancy,
  deleteCandidateResume,
  deleteVacancy,
  getCandidateApplications,
  getCandidateFavorites,
  getCandidateProfile,
  getCandidateProfileById,
  getEmployerProfile,
  getEmployerVacancies,
  getEmployerVacancyApplications,
  getVacancy,
  restoreVacancy,
  uploadCandidateProfilePhoto,
  uploadEmployerProfilePhoto,
  restoreCandidateResume,
  updateCandidateResume,
  updateCandidateProfile,
  updateEmployerProfile,
  updateEmployerApplicationStatus,
  updateEmployerVacancy,
} from "@/lib/api/profile";
import {
  BookOpen,
  Bookmark,
  Building2,
  Database,
  Flag,
  FileWarning,
  FileText,
  Send,
  Settings,
  Shield,
  User,
  UserCog,
  Heart,
  PlusCircle,
} from "lucide-react";

export function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuth();
  const role: RoleView | null = !user
    ? null
    : user.role === "ROLE_ADMIN"
      ? "admin"
      : user.role === "ROLE_EMPLOYER"
        ? "employer"
        : "candidate";
  const [candidateSection, setCandidateSection] =
    useState<CandidateSection>("profile");
  const [employerSection, setEmployerSection] =
    useState<EmployerSection>("profile");
  const [adminSection, setAdminSection] = useState<AdminSection>("overview");
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
  const [isVacancySaving, setIsVacancySaving] = useState(false);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionaries, setDictionaries] =
    useState<VacancyFormDictionaries | null>(null);

  useEffect(() => {
    if (!role || !user?.id) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);

        if (role === "admin") {
          return;
        }

        if (role === "candidate") {
          const [profile, history, favorites] = await Promise.all([
            getCandidateProfile(),
            getCandidateApplications(0, 10),
            getCandidateFavorites(0, 10),
          ]);
          if (!isMounted) return;
          const resumes = profile.resumes ?? [];
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
          return;
        }

        const [employerProfile, vacanciesResponse] = await Promise.all([
          getEmployerProfile(),
          getEmployerVacancies(0, 20),
        ]);
        if (!isMounted) return;
        const loadedVacancies = vacanciesResponse.content;
        setVacancies(loadedVacancies);
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
  }, [role, user?.id]);

  useEffect(() => {
    const sectionParam = searchParams.get(PROFILE_SECTION_PARAM);
    const vacancyParam = searchParams.get(VACANCY_FILTER_PARAM);

    if (role === "candidate") {
      setCandidateSection(
        isCandidateSection(sectionParam) ? sectionParam : "profile",
      );
      return;
    }

    if (role === "admin") {
      setAdminSection(isAdminSection(sectionParam) ? sectionParam : "overview");
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

  useEffect(() => {
    const shouldLoadDictionaries =
      (role === "candidate" && candidateSection === "resumes") ||
      (role === "employer" && employerSection === "vacancies");

    if (!shouldLoadDictionaries || dictionaries) {
      return;
    }

    let isMounted = true;

    async function loadDictionariesForCurrentSection() {
      try {
        const loadedDictionaries = await getVacancyFormDictionaries();
        if (!isMounted) {
          return;
        }

        setDictionaries(loadedDictionaries);
      } catch (error) {
        console.error("Failed to load profile dictionaries:", error);
        if (isMounted) {
          toast.error("Не удалось загрузить справочники для этого раздела.");
        }
      }
    }

    loadDictionariesForCurrentSection();

    return () => {
      isMounted = false;
    };
  }, [candidateSection, dictionaries, employerSection, role]);

  const roleLabel =
    role === "admin"
      ? "Администратор"
      : role === "candidate"
        ? "Соискатель"
        : "Работодатель";

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

  function changeAdminSection(section: AdminSection) {
    setAdminSection(section);
    router.push(profileSectionHref(section), { scroll: false });
  }

  function changeEmployerApplicationFilter(publicId: string) {
    setSelectedVacancy(publicId);
    setEmployerSection("applications");
    router.push(profileSectionHref("applications", publicId), {
      scroll: false,
    });
  }

  function changeCandidateFavoriteState(publicId: string, isFavorite: boolean) {
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
      city: textValue(formData.get("city")).trim(),
      openToWork: formData.get("openToWork") === "on",
    };

    try {
      setIsSaving(true);
      const updated = await updateCandidateProfile(payload);
      const updatedResumes = updated.resumes ?? [];
      setCandidate({ ...emptyCandidate, ...updated, resumes: updatedResumes });
      setCandidateResumes(updatedResumes);
      if (user) {
        setUser({ ...user, city: updated.city });
      }
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
      setCandidateResumes((items) =>
        items.filter((item) => item.id !== resumeId),
      );
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

  async function handleCreateVacancy(payload: VacancyPayload) {
    try {
      setIsVacancySaving(true);
      const created = await createVacancy(payload);
      setVacancies((items) => [created, ...items]);
      toast.success("Вакансия создана.");
      return created;
    } catch (error) {
      console.error("Failed to create vacancy:", error);
      toast.error("Не удалось создать вакансию.");
      throw error;
    } finally {
      setIsVacancySaving(false);
    }
  }

  async function handleUpdateVacancy(
    publicId: string,
    payload: VacancyPayload,
  ) {
    try {
      setIsVacancySaving(true);
      const updated = await updateEmployerVacancy(publicId, payload);
      setVacancies((items) =>
        items.map((item) => (item.publicId === publicId ? updated : item)),
      );
      toast.success("Вакансия сохранена.");
      return updated;
    } catch (error) {
      console.error("Failed to update vacancy:", error);
      toast.error("Не удалось сохранить вакансию.");
      throw error;
    } finally {
      setIsVacancySaving(false);
    }
  }

  async function handleArchiveVacancy(vacancy: EmployerVacancy) {
    const previousStatus = vacancy.status;

    try {
      setIsVacancySaving(true);
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: "ARCHIVED" }
            : item,
        ),
      );
      await archiveVacancy(vacancy.publicId);
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: "ARCHIVED" }
            : item,
        ),
      );
      toast.success("Вакансия архивирована.");
    } catch (error) {
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: previousStatus }
            : item,
        ),
      );
      console.error("Failed to archive vacancy:", error);
      toast.error("Не удалось архивировать вакансию.");
      throw error;
    } finally {
      setIsVacancySaving(false);
    }
  }

  async function handleRestoreVacancy(vacancy: EmployerVacancy) {
    const previousStatus = vacancy.status;

    try {
      setIsVacancySaving(true);
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: "APPROVED" }
            : item,
        ),
      );
      await restoreVacancy(vacancy.publicId);
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: "APPROVED" }
            : item,
        ),
      );
      toast.success("Р’Р°РєР°РЅСЃРёСЏ СЃРЅРѕРІР° Р°РєС‚РёРІРЅР°.");
    } catch (error) {
      setVacancies((items) =>
        items.map((item) =>
          item.publicId === vacancy.publicId
            ? { ...item, status: previousStatus }
            : item,
        ),
      );
      console.error("Failed to restore vacancy:", error);
      toast.error(
        "РќРµ СѓРґР°Р»РѕСЃСЊ РІРµСЂРЅСѓС‚СЊ РІР°РєР°РЅСЃРёСЋ РёР· Р°СЂС…РёРІР°.",
      );
      throw error;
    } finally {
      setIsVacancySaving(false);
    }
  }

  async function handleDeleteVacancy(vacancy: EmployerVacancy) {
    try {
      setIsVacancySaving(true);
      await deleteVacancy(vacancy.publicId);
      setVacancies((items) =>
        items.filter((item) => item.publicId !== vacancy.publicId),
      );
      setEmployerApplications((items) =>
        items.filter((item) => item.vacancyPublicId !== vacancy.publicId),
      );
      toast.success("Вакансия удалена.");
    } catch (error) {
      console.error("Failed to delete vacancy:", error);
      toast.error("Не удалось удалить вакансию.");
      throw error;
    } finally {
      setIsVacancySaving(false);
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
      } else if (role === "employer") {
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
      if (status === "ACCEPTED" && updated.chatId) {
        openChat(updated.chatId);
      }
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error("Не удалось обновить статус отклика.");
    }
  }

  function openChat(chatId: string) {
    window.dispatchEvent(
      new CustomEvent("intern-hub:open-chat", {
        detail: { chatId },
      }),
    );
  }

  if (!role || isLoading) {
    return <ProfilePageSkeleton roleLabel={roleLabel} />;
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9]">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          <div className="space-y-4 lg:sticky">
            {role === "admin" ? (
              <SectionMenu<AdminSection>
                active={adminSection}
                onChange={changeAdminSection}
                items={[
                  { id: "overview", label: "Обзор", icon: <Shield /> },
                  {
                    id: "vacancies",
                    label: "Модерация вакансий",
                    icon: <FileWarning />,
                  },
                  {
                    id: "manual-vacancy",
                    label: "Добавить вакансию",
                    icon: <PlusCircle />,
                  },
                  {
                    id: "employers",
                    label: "Добавить работодателя",
                    icon: <Building2 />,
                  },
                  {
                    id: "excluded-words",
                    label: "Стоп-слова",
                    icon: <Shield />,
                  },
                  {
                    id: "sources",
                    label: "Источники вакансий",
                    icon: <Database />,
                  },
                  { id: "complaints", label: "Жалобы", icon: <Flag /> },
                  { id: "users", label: "Пользователи", icon: <UserCog /> },
                  { id: "blog", label: "Блог", icon: <BookOpen /> },
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
            ) : role === "candidate" ? (
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
                    icon: <Heart />,
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
            {role === "admin" && adminSection !== "settings" ? (
              <AdminDashboardSection section={adminSection} />
            ) : null}

            {user && role === "admin" && adminSection === "settings" ? (
              <AccountSettingsSection
                user={user}
                isSaving={isSettingsSaving}
                onEmailChange={handleEmailChange}
                onPasswordResetRequest={handlePasswordResetRequest}
                onResendVerification={handleResendVerification}
              />
            ) : null}

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
                dictionaries={dictionaries}
                isSaving={isVacancySaving}
                onCreate={handleCreateVacancy}
                onUpdate={handleUpdateVacancy}
                onArchive={handleArchiveVacancy}
                onRestore={handleRestoreVacancy}
                onDelete={handleDeleteVacancy}
                onLoadVacancy={getVacancy}
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
                onOpenChat={openChat}
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
