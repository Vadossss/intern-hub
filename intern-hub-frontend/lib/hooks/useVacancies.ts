"use client";

import { PageResponse, VacancyResponseDto } from "@/app/types/api";
import { getVacancies, GetVacanciesParams } from "@/lib/api/vacancies";
import { useEffect, useState } from "react";

interface UseVacanciesResult {
  vacancies: VacancyResponseDto[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVacancies(
  params?: GetVacanciesParams,
): PageResponse<VacancyResponseDto> {
  const [data, setData] = useState<PageResponse<VacancyResponseDto>>({
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
      const response = (await getVacancies(
        params,
      )) as unknown as PageResponse<VacancyResponseDto>;
      console.log(response);

      setData(response);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch vacancies"),
      );
      console.error("Error fetching vacancies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, [JSON.stringify(params)]);

  return data;
}
