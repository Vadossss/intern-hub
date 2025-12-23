"use client";

import { useState, useEffect } from "react";
import { getStacks, Stack } from "@/lib/api/stacks";
import { ApiError } from "@/lib/api/client";

interface UseStacksResult {
  stacks: Stack[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Хук для получения списка стеков
 */
export function useStacks(): UseStacksResult {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStacks();
      setStacks(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch stacks")
      );
      console.error("Error fetching stacks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, []);

  return {
    stacks,
    loading,
    error,
    refetch: fetchStacks,
  };
}
