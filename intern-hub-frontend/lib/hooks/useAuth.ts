"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentUser,
  login,
  register,
  type LoginParams,
  type RegisterParams,
} from "../api/auth";
import { ApiError } from "../api/client";
import { useAuth as useAuthStore } from "../auth/context";

interface UseAuthResult {
  loading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: (credentials: LoginParams) => Promise<void>;
  register: (credentials: RegisterParams) => Promise<void>;
  clearError: () => void;
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
        setError(new Error(getAuthErrorMessage(err, "login")));
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [router, setIsAuthenticated, setUser],
  );

  const performRegister = useCallback(
    async (credentials: RegisterParams) => {
      try {
        setLoading(true);
        setError(null);

        await register(credentials);
        const user = await getCurrentUser();

        setUser(user);
        setIsAuthenticated(true);
        router.push("/profile");
      } catch (err) {
        setError(new Error(getAuthErrorMessage(err, "register")));
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [router, setIsAuthenticated, setUser],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    isAuthenticated,
    error,
    login: performLogin,
    register: performRegister,
    clearError,
  };
}

function getAuthErrorMessage(error: unknown, mode: "login" | "register") {
  if (error instanceof ApiError) {
    const serverMessage = getServerErrorMessage(error.data).toLowerCase();

    if (mode === "login") {
      if (
        error.status === 401 ||
        error.status === 404 ||
        serverMessage.includes("incorrect password") ||
        serverMessage.includes("user not found")
      ) {
        return "Неверная почта или пароль.";
      }

      if (error.status === 403 || serverMessage.includes("blocked")) {
        return "Аккаунт заблокирован. Обратитесь в поддержку.";
      }

      return "Не удалось войти. Проверьте данные и попробуйте снова.";
    }

    if (
      error.status === 409 ||
      serverMessage.includes("email already exists")
    ) {
      return "Пользователь с такой почтой уже зарегистрирован.";
    }

    if (error.status === 400) {
      return "Проверьте почту и пароль: часть данных заполнена некорректно.";
    }

    if (error.status >= 500) {
      return "Не удалось создать аккаунт из-за ошибки сервера. Попробуйте позже.";
    }

    return "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.";
  }

  if (error instanceof Error && error.message.startsWith("Network error")) {
    return "Не удалось подключиться к серверу. Проверьте соединение.";
  }

  return mode === "login"
    ? "Не удалось войти. Попробуйте снова."
    : "Не удалось зарегистрироваться. Попробуйте снова.";
}

function getServerErrorMessage(data: unknown) {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const message = record.message ?? record.error ?? record.detail;

    if (typeof message === "string") {
      return message;
    }
  }

  return "";
}
