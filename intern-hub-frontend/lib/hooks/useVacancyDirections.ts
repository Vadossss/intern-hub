"use client";

import { useEffect, useState } from "react";

import {
  getVacancyDirections,
  type DictionaryItem,
} from "@/lib/api/dictionaries";

interface UseVacancyDirectionsResult {
  directions: DictionaryItem[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVacancyDirections(): UseVacancyDirectionsResult {
  const [directions, setDirections] = useState<DictionaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchDirections() {
    try {
      setLoading(true);
      setError(null);
      setDirections(await getVacancyDirections());
    } catch (err) {
      const nextError =
        err instanceof Error ? err : new Error("Failed to fetch directions");
      setError(nextError);
      console.error("Error fetching vacancy directions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDirections();
  }, []);

  return {
    directions,
    loading,
    error,
    refetch: fetchDirections,
  };
}
