"use client";

import { useState, useEffect } from "react";
import {
  getVacancies,
  GetVacanciesParams,
  VacanciesResponse,
} from "@/lib/api/vacancies";
import { Vacancy } from "@/components/shared/VacancyCard";

interface UseVacanciesResult {
  vacancies: Vacancy[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для получения списка вакансий
 */
export function useVacancies(params?: GetVacanciesParams): UseVacanciesResult {
  const [data, setData] = useState<VacanciesResponse>({
    content: [],
    pageNumber: 0,
    pageSize: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVacancies(params);
      console.log(response);

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch vacancies")
      );
      console.error("Error fetching vacancies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, [JSON.stringify(params)]);

  return {
    vacancies: data.content,
    total: data.totalElements,
    loading,
    error,
    refetch: fetchVacancies,
  };
}
