import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";
import { Direction } from "@/components/shared/DirectionSelector";
import { InterviewQuestion } from "@/components/shared/InterviewQuestionCard";

/**
 * Параметры для получения вопросов
 */
export interface GetQuestionsParams {
  direction?: Direction;
  category?: "technical" | "behavioral" | "system-design" | "algorithm";
  difficulty?: "easy" | "medium" | "hard";
  limit?: number;
  offset?: number;
}

/**
 * Ответ API для списка вопросов
 */
export interface QuestionsResponse {
  items: InterviewQuestion[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Получить список вопросов
 */
export async function getQuestions(params?: GetQuestionsParams): Promise<QuestionsResponse> {
  return apiClient.get<QuestionsResponse>(API_ENDPOINTS.questions, {
    params: params as Record<string, string | number | boolean | null | undefined>,
  });
}

/**
 * Получить вопрос по ID
 */
export async function getQuestionById(id: string): Promise<InterviewQuestion> {
  return apiClient.get<InterviewQuestion>(`${API_ENDPOINTS.questions}/${id}`);
}



