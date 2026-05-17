import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface CitySuggestion {
  name: string;
  regionFullname?: string | null;
}

export function getCitySuggestions(
  query: string,
  limit = 8,
): Promise<CitySuggestion[]> {
  return apiClient.get<CitySuggestion[]>(API_ENDPOINTS.citySuggestions, {
    params: { query, limit },
  });
}
