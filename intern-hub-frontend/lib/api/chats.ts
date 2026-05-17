import { apiClient } from "./client";
import { API_CONFIG, API_ENDPOINTS } from "./config";

export interface ChatRoom {
  chatId: string;
  candidateId?: number;
  employerId?: number;
  candidateName?: string;
  employerName?: string;
  candidateAvatarUrl?: string;
  employerAvatarUrl?: string;
  vacancyPublicId?: string;
  vacancyTitle?: string;
  resumeId?: number;
  resumeProfession?: string;
  applicationId?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  senderName?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  status?: string;
}

export interface ChatMessagePayload {
  chatId?: string;
  content: string;
}

export interface EmployerInviteCandidatePayload {
  vacancyPublicId: string;
  message: string;
}

export function getChats(): Promise<ChatRoom[]> {
  return apiClient.get<ChatRoom[]>(API_ENDPOINTS.chats);
}

export function getChatMessages(chatId: string): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(
    `${API_ENDPOINTS.chats}/${encodeURIComponent(chatId)}/messages`,
  );
}

export function sendChatMessage(
  chatId: string,
  payload: ChatMessagePayload,
): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(
    `${API_ENDPOINTS.chats}/${encodeURIComponent(chatId)}/messages`,
    payload,
  );
}

export function markChatRead(chatId: string): Promise<ChatMessage[]> {
  return apiClient.post<ChatMessage[]>(
    `${API_ENDPOINTS.chats}/${encodeURIComponent(chatId)}/read`,
    {},
  );
}

export function inviteCandidateToChat(
  resumeId: number,
  payload: EmployerInviteCandidatePayload,
): Promise<ChatRoom> {
  return apiClient.post<ChatRoom>(
    `${API_ENDPOINTS.employerCandidates}/resumes/${resumeId}/invite`,
    payload,
  );
}

export function buildChatWebSocketUrl() {
  const url = new URL(API_CONFIG.baseURL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/chats";
  url.search = "";

  return url.toString();
}
