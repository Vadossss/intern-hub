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

export type ComplaintTargetType =
  | "VACANCY"
  | "EMPLOYER_PROFILE"
  | "CANDIDATE_RESUME";

export type ComplaintReason =
  | "SPAM"
  | "FRAUD"
  | "MISLEADING_INFORMATION"
  | "OFFENSIVE_CONTENT"
  | "DISCRIMINATION"
  | "ILLEGAL_CONTENT"
  | "OTHER";

export type ComplaintStatus =
  | "NEW"
  | "IN_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELED";

export type ComplaintModerationStatus = "IN_REVIEW" | "RESOLVED" | "CANCELED";

export interface ComplaintReasonCount {
  reason: ComplaintReason;
  count: number;
}

export interface ComplaintAdminItem {
  id: number;
  reason: ComplaintReason;
  description?: string | null;
  status: ComplaintStatus;
  reporterId?: number | null;
  reporterEmail?: string | null;
  moderatorId?: number | null;
  moderatorEmail?: string | null;
  moderationComment?: string | null;
  moderatedAt?: string | null;
  createdAt?: string | null;
}

export interface ComplaintGroup {
  targetType: ComplaintTargetType;
  targetId: string;
  targetTitle: string;
  targetSubtitle?: string | null;
  targetHref?: string | null;
  ownerId?: number | null;
  ownerName?: string | null;
  ownerStatus?: string | null;
  ownerBlocked?: boolean | null;
  totalCount: number;
  newCount: number;
  lastCreatedAt?: string | null;
  reasonCounts: ComplaintReasonCount[];
  complaints: ComplaintAdminItem[];
}

export interface ComplaintGroupStatusPayload {
  targetType: ComplaintTargetType;
  targetId: string;
  status: ComplaintModerationStatus;
  moderationComment?: string;
}

export interface ComplaintGroupBlockPayload {
  targetType: ComplaintTargetType;
  targetId: string;
  reason?: string;
  until?: string;
  moderationComment?: string;
}

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

export function getComplaintGroups(): Promise<ComplaintGroup[]> {
  return apiClient.get<ComplaintGroup[]>(
    `${API_ENDPOINTS.complaints}/admin/groups`,
  );
}

export function updateComplaintGroupStatus(
  payload: ComplaintGroupStatusPayload,
): Promise<ComplaintGroup[]> {
  return apiClient.patch<ComplaintGroup[]>(
    `${API_ENDPOINTS.complaints}/admin/groups/status`,
    payload,
  );
}

export function blockComplaintGroupOwner(
  payload: ComplaintGroupBlockPayload,
): Promise<ComplaintGroup[]> {
  return apiClient.post<ComplaintGroup[]>(
    `${API_ENDPOINTS.complaints}/admin/groups/block-owner`,
    payload,
  );
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
