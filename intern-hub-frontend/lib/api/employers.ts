import type { PageResponse, VacancyResponseDto } from "@/app/types/api";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface PublicEmployerProfile {
  userId?: string | number;
  id?: string | number;
  companyName?: string;
  logoUrl?: string;
  avatarUrl?: string;
  city?: string;
  about?: string;
  website?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  verified?: boolean;
  verificationStatus?: string;
  createdAt?: string;
}

export interface GetEmployersParams {
  query?: string;
  page?: number;
  size?: number;
}

export async function getEmployers(
  params: GetEmployersParams = {},
): Promise<PageResponse<PublicEmployerProfile>> {
  return apiClient.get<PageResponse<PublicEmployerProfile>>("/api/employers", {
    params: {
      query: params.query,
      page: params.page,
      size: params.size,
    },
  });
}

export async function getEmployerById(
  employerId: string,
): Promise<PublicEmployerProfile> {
  return apiClient.get<PublicEmployerProfile>(`/api/employers/${employerId}`);
}

export async function getEmployerVacanciesById(
  employerId: string,
  page = 0,
  size = 50,
): Promise<PageResponse<VacancyResponseDto>> {
  return apiClient.get<PageResponse<VacancyResponseDto>>(API_ENDPOINTS.vacancies, {
    params: {
      employerId,
      page,
      size,
    },
  });
}
