"use client";

import { useState, useCallback, useEffect } from "react";
import { login, validateToken, LoginParams, LoginResponse } from "../api/auth";
import { useRouter } from "next/navigation";
import { useAuth as useAuthStore } from "../auth/context";

interface UseAuthResult {
  accessToken: string;
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: (credentials: LoginParams) => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const [data, setData] = useState<LoginResponse>({
    accessToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performLogin = useCallback(
    async (credentials: LoginParams) => {
      try {
        setLoading(true);
        setError(null);
        const response = await login(credentials);
        setData(response);
        try {
          const isValid = await validateToken();
          setIsAuthenticated(isValid);
        } catch {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to login"));
        console.error("Error during login:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    },
    [setIsAuthenticated]
  );

  useEffect(() => {
    if (data.accessToken != "" && isAuthenticated) {
      router.push("/");
    }
  }, [data.accessToken, isAuthenticated, router]);

  return {
    accessToken: data.accessToken,
    loading,
    isAuthenticated,
    error,
    login: performLogin,
  };
}
