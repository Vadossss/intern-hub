import type { CandidateProfile } from "@/lib/api/profile";
import { apiClient } from "@/lib/api/client";

export type PublicCandidateProfile = CandidateProfile;

export function getCandidateById(
  candidateId: string,
): Promise<PublicCandidateProfile> {
  return apiClient.get<PublicCandidateProfile>(`/api/candidates/${candidateId}`);
}
