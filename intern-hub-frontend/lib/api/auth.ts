import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import { Direction } from "@/components/shared/DirectionSelector";
import { Vacancy } from "@/components/shared/VacancyCard";

/**
 * Параметры для получения вакансий
 */
export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export async function login(data?: LoginParams): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.login, data);
}

export async function validateToken(): Promise<boolean> {
  return apiClient.get<boolean>(API_ENDPOINTS.validateToken);
}

//
// export async function getVacancyById(id: string): Promise<Vacancy> {
//   return apiClient.get<Vacancy>(`${API_ENDPOINTS.vacancies}/${id}`);
// }
