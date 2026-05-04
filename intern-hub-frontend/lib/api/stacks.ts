import { Direction } from "@/components/shared/DirectionSelector";
import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface Stack {
  id: string;
  name: string;
  href: (dir: Direction | null) => string;
}

export async function getStacks(): Promise<Stack[]> {
  return apiClient.get<Stack[]>(API_ENDPOINTS.stack);
}
