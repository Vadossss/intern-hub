import type { PageResponse, VacancyResponseDto } from "@/app/types/api";

import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface VacancyExcludedWord {
  id: number;
  word: string;
  active: boolean;
}

export interface VacancyExcludedWordPayload {
  word: string;
  active: boolean;
}

export type AdminUserRole = "ROLE_USER" | "ROLE_EMPLOYER" | "ROLE_ADMIN";

export function getPendingVacancies(
  page = 0,
  size = 10,
): Promise<PageResponse<VacancyResponseDto>> {
  return apiClient.get<PageResponse<VacancyResponseDto>>(
    API_ENDPOINTS.moderationVacancies,
    { params: { page, size } },
  );
}

export function approveModerationVacancy(publicId: string): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.moderationVacancies}/${publicId}/approve`,
  );
}

export function rejectModerationVacancy(publicId: string): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.moderationVacancies}/${publicId}/reject`,
  );
}

export function getVacancyExcludedWords(): Promise<VacancyExcludedWord[]> {
  return apiClient.get<VacancyExcludedWord[]>(API_ENDPOINTS.vacancyExcludedWords);
}

export function createVacancyExcludedWord(
  payload: VacancyExcludedWordPayload,
): Promise<VacancyExcludedWord> {
  return apiClient.post<VacancyExcludedWord>(
    API_ENDPOINTS.vacancyExcludedWords,
    payload,
  );
}

export function updateVacancyExcludedWord(
  wordId: number,
  payload: VacancyExcludedWordPayload,
): Promise<VacancyExcludedWord> {
  return apiClient.patch<VacancyExcludedWord>(
    `${API_ENDPOINTS.vacancyExcludedWords}/${wordId}`,
    payload,
  );
}

export function deleteVacancyExcludedWord(wordId: number): Promise<void> {
  return apiClient.delete<void>(
    `${API_ENDPOINTS.vacancyExcludedWords}/${wordId}`,
  );
}

export function changeModeratedUserRole(
  userId: number,
  role: AdminUserRole,
): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.moderationUsers}/${userId}/role`,
    { role },
  );
}

export function blockModeratedUser(
  userId: number,
  reason?: string,
  until?: string,
): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.moderationUsers}/${userId}/block`,
    { reason: reason || undefined, until: until || undefined },
  );
}

export function unblockModeratedUser(userId: number): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.moderationUsers}/${userId}/unblock`,
  );
}
