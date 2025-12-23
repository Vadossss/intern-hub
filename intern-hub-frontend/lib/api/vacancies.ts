import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import { Direction } from "@/components/shared/DirectionSelector";
import { Vacancy } from "@/components/shared/VacancyCard";

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
  content: Vacancy[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/**
 * Получить список вакансий
 */
export async function getVacancies(
  params?: GetVacanciesParams
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

/**
 * Получить вакансию по ID
 */
export async function getVacancyById(id: string): Promise<Vacancy> {
  return apiClient.get<Vacancy>(`${API_ENDPOINTS.vacancies}/${id}`);
}
