export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000,
} as const;

export const API_ENDPOINTS = {
  stacks: "/stacks",
  vacancies: "/vacancy",
  tasks: "/tasks",
  questions: "/questions",
  skills: "/skills",
  login: "/auth/login",
  validateToken: "/auth/validateToken",
} as const;
