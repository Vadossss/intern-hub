import type { User } from "../auth/context";
import { ApiError, apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface LoginParams {
  email: string;
  password: string;
}

export type RegisterParams = LoginParams;

export type LoginResponse = string | Record<string, never>;

export async function login(data: LoginParams): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.login, data);
}

export async function register(data: RegisterParams): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.register, data);
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(API_ENDPOINTS.me);
}

export async function refreshToken(): Promise<void> {
  return apiClient.post(API_ENDPOINTS.refreshToken);
}

export async function getCurrentUserWithRefresh(): Promise<User> {
  return getCurrentUser();
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.logout);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      try {
        await refreshToken();
        await apiClient.post(API_ENDPOINTS.logout);
      } catch {
        return;
      }

      return;
    }

    throw error;
  }
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post<void>(
    `${API_ENDPOINTS.verifyEmail}?token=${encodeURIComponent(token)}`,
  );
}

export async function resendEmailVerification(email: string): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.resendEmailVerification, { email });
}

export async function changeEmail(email: string): Promise<User> {
  const user = await apiClient.post<User>(API_ENDPOINTS.changeEmail, { email });
  await refreshToken();
  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.forgotPassword, { email });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await apiClient.post<void>(API_ENDPOINTS.resetPassword, { token, password });
}
