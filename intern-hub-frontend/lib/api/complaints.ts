import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

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

export interface ComplaintReasonOption {
  value: ComplaintReason;
  label: string;
}

export interface ComplaintPayload {
  targetType: ComplaintTargetType;
  targetId: string;
  reason: ComplaintReason;
  description?: string;
}

export interface ComplaintResponse {
  id: number;
  targetType: ComplaintTargetType;
  targetId: string;
  reason: ComplaintReason;
  description?: string | null;
  status: string;
  createdAt: string;
}

export const complaintReasonOptions: ComplaintReasonOption[] = [
  { value: "SPAM", label: "Спам" },
  { value: "FRAUD", label: "Мошенничество" },
  { value: "MISLEADING_INFORMATION", label: "Недостоверная информация" },
  { value: "OFFENSIVE_CONTENT", label: "Оскорбительный контент" },
  { value: "DISCRIMINATION", label: "Дискриминация" },
  { value: "ILLEGAL_CONTENT", label: "Запрещенный контент" },
  { value: "OTHER", label: "Другое" },
];

export function createComplaint(
  payload: ComplaintPayload,
): Promise<ComplaintResponse> {
  return apiClient.post<ComplaintResponse>(API_ENDPOINTS.complaints, payload);
}
