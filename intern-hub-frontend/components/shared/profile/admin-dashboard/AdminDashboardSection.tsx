"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import type { VacancyResponseDto } from "@/app/types/api";
import {
  type AdminUserRole,
  type ComplaintGroup,
  type ComplaintModerationStatus,
  type VacancyExcludedWord,
  approveModerationVacancy,
  blockComplaintGroupOwner,
  blockModeratedUser,
  changeModeratedUserRole,
  createVacancyExcludedWord,
  deleteVacancyExcludedWord,
  getComplaintGroups,
  getPendingVacancies,
  getVacancyExcludedWords,
  rejectModerationVacancy,
  unblockModeratedUser,
  updateComplaintGroupStatus,
  updateVacancyExcludedWord,
} from "@/lib/api/admin";

import { AdminOverviewSection } from "./AdminOverviewSection";
import { AdminSectionSkeleton } from "./AdminSectionSkeleton";
import { BlogAdminSection } from "./BlogAdminSection";
import { ComplaintsSection } from "./ComplaintsSection";
import { ExcludedWordsSection } from "./ExcludedWordsSection";
import { ModerationVacanciesSection } from "./ModerationVacanciesSection";
import type { AdminWorkspaceSection } from "./types";
import { UsersSection } from "./UsersSection";
import { byWord, toLocalDateTime } from "./utils";

export function AdminDashboardSection({
  section,
}: {
  section: AdminWorkspaceSection;
}) {
  const [pendingVacancies, setPendingVacancies] = useState<
    VacancyResponseDto[]
  >([]);
  const [pendingVacanciesTotal, setPendingVacanciesTotal] = useState(0);
  const [excludedWords, setExcludedWords] = useState<VacancyExcludedWord[]>([]);
  const [complaintGroups, setComplaintGroups] = useState<ComplaintGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newWordActive, setNewWordActive] = useState(true);
  const [userId, setUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminUserRole>("ROLE_USER");
  const [blockReason, setBlockReason] = useState("");
  const [blockUntil, setBlockUntil] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      try {
        setIsLoading(true);
        const [vacanciesResponse, wordsResponse, complaintGroupsResponse] =
          await Promise.all([
            getPendingVacancies(0, 10),
            getVacancyExcludedWords(),
            getComplaintGroups(),
          ]);

        if (!active) {
          return;
        }

        setPendingVacancies(vacanciesResponse.content);
        setPendingVacanciesTotal(vacanciesResponse.totalElements);
        setExcludedWords(wordsResponse);
        setComplaintGroups(complaintGroupsResponse);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
        if (active) {
          toast.error("Не удалось загрузить данные кабинета администратора.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadAdminData();

    return () => {
      active = false;
    };
  }, []);

  const activeExcludedWords = useMemo(
    () => excludedWords.filter((word) => word.active).length,
    [excludedWords],
  );
  const newComplaintsTotal = useMemo(
    () => complaintGroups.reduce((total, group) => total + group.newCount, 0),
    [complaintGroups],
  );

  if (isLoading) {
    return <AdminSectionSkeleton section={section} />;
  }

  async function moderateVacancy(
    publicId: string,
    action: "approve" | "reject",
  ) {
    try {
      setIsSaving(true);

      if (action === "approve") {
        await approveModerationVacancy(publicId);
        toast.success("Вакансия опубликована.");
      } else {
        await rejectModerationVacancy(publicId);
        toast.success("Вакансия отклонена.");
      }

      setPendingVacancies((items) =>
        items.filter((vacancy) => vacancy.publicId !== publicId),
      );
      setPendingVacanciesTotal((total) => Math.max(total - 1, 0));
    } catch (error) {
      console.error("Failed to moderate vacancy:", error);
      toast.error("Не удалось обновить статус вакансии.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addExcludedWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const word = newWord.trim();

    if (!word) {
      toast.error("Введите стоп-слово.");
      return;
    }

    try {
      setIsSaving(true);
      const created = await createVacancyExcludedWord({
        word,
        active: newWordActive,
      });
      setExcludedWords((items) => [...items, created].sort(byWord));
      setNewWord("");
      setNewWordActive(true);
      toast.success("Стоп-слово добавлено.");
    } catch (error) {
      console.error("Failed to create excluded word:", error);
      toast.error("Не удалось добавить стоп-слово.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleExcludedWord(word: VacancyExcludedWord) {
    try {
      setIsSaving(true);
      const updated = await updateVacancyExcludedWord(word.id, {
        word: word.word,
        active: !word.active,
      });
      setExcludedWords((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.error("Failed to update excluded word:", error);
      toast.error("Не удалось обновить стоп-слово.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeExcludedWord(wordId: number) {
    try {
      setIsSaving(true);
      await deleteVacancyExcludedWord(wordId);
      setExcludedWords((items) => items.filter((item) => item.id !== wordId));
      toast.success("Стоп-слово удалено.");
    } catch (error) {
      console.error("Failed to delete excluded word:", error);
      toast.error("Не удалось удалить стоп-слово.");
    } finally {
      setIsSaving(false);
    }
  }

  async function moderateComplaintGroup(
    group: ComplaintGroup,
    status: ComplaintModerationStatus,
    moderationComment: string,
  ) {
    try {
      setIsSaving(true);
      const updatedGroups = await updateComplaintGroupStatus({
        targetType: group.targetType,
        targetId: group.targetId,
        status,
        moderationComment: moderationComment.trim() || undefined,
      });
      setComplaintGroups(updatedGroups);
      toast.success("Статус жалоб обновлён.");
    } catch (error) {
      console.error("Failed to update complaint group status:", error);
      toast.error("Не удалось обновить статус жалоб.");
    } finally {
      setIsSaving(false);
    }
  }

  async function blockComplaintOwner(
    group: ComplaintGroup,
    reason: string,
    moderationComment: string,
  ) {
    if (!group.ownerId) {
      toast.error("У этой сущности не найден владелец для блокировки.");
      return;
    }

    try {
      setIsSaving(true);
      const updatedGroups = await blockComplaintGroupOwner({
        targetType: group.targetType,
        targetId: group.targetId,
        reason: reason.trim() || undefined,
        moderationComment: moderationComment.trim() || undefined,
      });
      setComplaintGroups(updatedGroups);
      toast.success("Владелец заблокирован, жалобы отмечены как решённые.");
    } catch (error) {
      console.error("Failed to block complaint target owner:", error);
      toast.error("Не удалось заблокировать владельца по жалобам.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changeRole() {
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) {
      toast.error("Введите корректный ID пользователя.");
      return;
    }

    try {
      setIsSaving(true);
      await changeModeratedUserRole(id, selectedRole);
      toast.success("Роль пользователя обновлена.");
    } catch (error) {
      console.error("Failed to change user role:", error);
      toast.error("Не удалось изменить роль пользователя.");
    } finally {
      setIsSaving(false);
    }
  }

  async function blockUser() {
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) {
      toast.error("Введите корректный ID пользователя.");
      return;
    }

    try {
      setIsSaving(true);
      await blockModeratedUser(
        id,
        blockReason.trim(),
        toLocalDateTime(blockUntil),
      );
      toast.success("Пользователь заблокирован.");
    } catch (error) {
      console.error("Failed to block user:", error);
      toast.error("Не удалось заблокировать пользователя.");
    } finally {
      setIsSaving(false);
    }
  }

  async function unblockUser() {
    const id = Number(userId);
    if (!Number.isFinite(id) || id <= 0) {
      toast.error("Введите корректный ID пользователя.");
      return;
    }

    try {
      setIsSaving(true);
      await unblockModeratedUser(id);
      toast.success("Пользователь разблокирован.");
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Не удалось разблокировать пользователя.");
    } finally {
      setIsSaving(false);
    }
  }

  if (section === "vacancies") {
    return (
      <ModerationVacanciesSection
        isLoading={isLoading}
        isSaving={isSaving}
        pendingVacancies={pendingVacancies}
        pendingVacanciesTotal={pendingVacanciesTotal}
        onModerate={moderateVacancy}
      />
    );
  }

  if (section === "excluded-words") {
    return (
      <ExcludedWordsSection
        excludedWords={excludedWords}
        isLoading={isLoading}
        isSaving={isSaving}
        newWord={newWord}
        newWordActive={newWordActive}
        onAdd={addExcludedWord}
        onNewWordActiveChange={setNewWordActive}
        onNewWordChange={setNewWord}
        onRemove={removeExcludedWord}
        onToggle={toggleExcludedWord}
      />
    );
  }

  if (section === "complaints") {
    return (
      <ComplaintsSection
        complaintGroups={complaintGroups}
        isLoading={isLoading}
        isSaving={isSaving}
        newComplaintsTotal={newComplaintsTotal}
        onBlockOwner={blockComplaintOwner}
        onStatusChange={moderateComplaintGroup}
      />
    );
  }

  if (section === "users") {
    return (
      <UsersSection
        blockReason={blockReason}
        blockUntil={blockUntil}
        isSaving={isSaving}
        selectedRole={selectedRole}
        userId={userId}
        onBlock={blockUser}
        onBlockReasonChange={setBlockReason}
        onBlockUntilChange={setBlockUntil}
        onRoleChange={setSelectedRole}
        onRoleSubmit={changeRole}
        onUnblock={unblockUser}
        onUserIdChange={setUserId}
      />
    );
  }

  if (section === "blog") {
    return <BlogAdminSection />;
  }

  return (
    <AdminOverviewSection
      activeExcludedWords={activeExcludedWords}
      complaintGroupsTotal={complaintGroups.length}
      excludedWordsTotal={excludedWords.length}
      newComplaintsTotal={newComplaintsTotal}
      pendingVacanciesTotal={pendingVacanciesTotal}
    />
  );
}
