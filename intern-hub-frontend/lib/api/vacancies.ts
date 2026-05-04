import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import { VacancyResponseDto } from "@/app/types/api";

/**
 * Параметры для получения вакансий
 */
export interface GetVacanciesParams {
  source?: string;
  position?: string;
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
    params: params
      ? (params as unknown as Record<
          string,
          string | number | boolean | null | undefined
        >)
      : undefined,
  });
}

export async function getVacancyById(id: string): Promise<VacancyResponseDto> {
  return apiClient.get<VacancyResponseDto>(`${API_ENDPOINTS.vacancies}/${id}`);
}
