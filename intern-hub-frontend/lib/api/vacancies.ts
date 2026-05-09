import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import type {
  ApplicationDto,
  ApplicationStatusDto,
  ApplyRequestDto,
  VacancyResponseDto,
} from "@/app/types/api";

/**
 * Параметры для получения вакансий
 */
export interface GetVacanciesParams {
  source?: string[];
  position?: string;
  direction?: string[];
  companyName?: string;
  employerId?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  searchText?: string;
  status?: string;
  workFormats?: string[];
  employment?: string[];
  experience?: string[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

/**
 * Ответ API для списка вакансий
 */
export interface VacanciesResponse {
  content: VacancyResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function getVacancies(
  params?: GetVacanciesParams,
): Promise<VacanciesResponse> {
  return apiClient.get<VacanciesResponse>(API_ENDPOINTS.vacancies, {
    params: params as Record<
      string,
      string | number | boolean | string[] | undefined
    >,
  });
}

export async function getVacancyById(id: string): Promise<VacancyResponseDto> {
  return apiClient.get<VacancyResponseDto>(`${API_ENDPOINTS.vacancies}/${id}`);
}

export async function applyToVacancy(
  id: string,
  data: ApplyRequestDto,
): Promise<ApplicationDto> {
  return apiClient.post<ApplicationDto>(
    `${API_ENDPOINTS.vacancies}/${id}/apply`,
    data,
  );
}

export async function getVacancyApplicationStatus(
  id: string,
): Promise<ApplicationStatusDto> {
  return apiClient.get<ApplicationStatusDto>(
    `${API_ENDPOINTS.vacancies}/${id}/application-status`,
  );
}
