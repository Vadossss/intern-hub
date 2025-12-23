import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import { Direction } from "@/components/shared/DirectionSelector";
import { Task } from "@/components/shared/TaskCard";

/**
 * Параметры для получения заданий
 */
export interface GetTasksParams {
  direction?: Direction;
  difficulty?: "easy" | "medium" | "hard";
  limit?: number;
  offset?: number;
}

/**
 * Ответ API для списка заданий
 */
export interface TasksResponse {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Получить список заданий
 */
export async function getTasks(params?: GetTasksParams): Promise<TasksResponse> {
  return apiClient.get<TasksResponse>(API_ENDPOINTS.tasks, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

/**
 * Получить задание по ID
 */
export async function getTaskById(id: string): Promise<Task> {
  return apiClient.get<Task>(`${API_ENDPOINTS.tasks}/${id}`);
}



