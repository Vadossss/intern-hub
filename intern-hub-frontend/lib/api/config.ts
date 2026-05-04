export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000,
} as const;

export const API_ENDPOINTS = {
  stack: "/api/stack",
  currency: "/api/currency",
  employment: "/api/employment",
  experience: "/api/experience",
  workFormat: "/api/format",
  vacancies: "/api/vacancies",
  tasks: "/api/tasks",
  questions: "/api/questions",
  skills: "/api/skill",
  login: "/api/auth/login",
  refreshToken: "/api/auth/update-refresh-token",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
  userVacanciesFavorite: "/api/vacancies/favorites",
  userProfile: "/api/users/me/profile",
  userApplicationsHistory: "/api/users/me/applications/history",
  employerVacancies: "/api/employer/me/vacancies",
  employerApplications: "/api/employer/me/applications",
} as const;
