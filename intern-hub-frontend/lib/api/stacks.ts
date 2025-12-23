import { Direction } from "@/components/shared/DirectionSelector";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

/**
 * Тип для стека технологий
 */
export interface Stack {
  id: string;
  name: string;
  href: (dir: Direction | null) => string;
}

/**
 * Получить все стеки
 */
export async function getStacks(): Promise<Stack[]> {
  return apiClient.get<Stack[]>(API_ENDPOINTS.stacks);
}

/**
 * Получить стек по ID
 */
// export async function getStackById(id: string): Promise<Stack> {
//   return apiClient.get<Stack>(`${API_ENDPOINTS.stacks}/${id}`);
// }

// /**
//  * Получить стек по slug
//  */
// export async function getStackBySlug(slug: string): Promise<Stack> {
//   return apiClient.get<Stack>(`${API_ENDPOINTS.stacks}/slug/${slug}`);
// }
