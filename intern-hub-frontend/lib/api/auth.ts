import type { User } from "../auth/context";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface LoginParams {
  email: string;
  password: string;
}

export type LoginResponse = string | Record<string, never>;

export async function login(data: LoginParams): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(API_ENDPOINTS.login, data);
}

export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(API_ENDPOINTS.me);
}

export async function refreshToken(): Promise<void> {
  return apiClient.post(API_ENDPOINTS.refreshToken);
}

export async function getCurrentUserWithRefresh(): Promise<User> {
  try {
    return await getCurrentUser();
  } catch {
    await refreshToken();
    return getCurrentUser();
  }
}

export async function logout(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.logout);
}
