"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, login, LoginParams } from "../api/auth";
import { useAuth as useAuthStore } from "../auth/context";

interface UseAuthResult {
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: (credentials: LoginParams) => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performLogin = useCallback(
    async (credentials: LoginParams) => {
      try {
        setLoading(true);
        setError(null);

        await login(credentials);
        const user = await getCurrentUser();

        setUser(user);
        setIsAuthenticated(true);
        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to login"));
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [router, setIsAuthenticated, setUser],
  );

  return {
    loading,
    isAuthenticated,
    error,
    login: performLogin,
  };
}
