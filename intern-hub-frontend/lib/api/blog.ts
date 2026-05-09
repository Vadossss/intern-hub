import type { PageResponse } from "@/app/types/api";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface BlogArticle {
  id: number;
  title: string;
  summary?: string | null;
  content: string;
  coverImageUrl?: string | null;
  authorId?: number;
  authorName?: string | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogArticlePayload {
  title: string;
  summary?: string | null;
  content: string;
  coverImageUrl?: string | null;
  published?: boolean;
}

export interface GetBlogArticlesParams {
  query?: string;
  page?: number;
  size?: number;
}

export async function getBlogArticles(
  params: GetBlogArticlesParams = {},
): Promise<PageResponse<BlogArticle>> {
  return apiClient.get<PageResponse<BlogArticle>>(API_ENDPOINTS.blogArticles, {
    params: {
      query: params.query,
      page: params.page,
      size: params.size,
    },
  });
}

export async function getBlogArticle(articleId: string | number) {
  return apiClient.get<BlogArticle>(`${API_ENDPOINTS.blogArticles}/${articleId}`);
}

export async function createBlogArticle(payload: BlogArticlePayload) {
  return apiClient.post<BlogArticle>(API_ENDPOINTS.blogArticles, payload);
}

export async function updateBlogArticle(
  articleId: string | number,
  payload: BlogArticlePayload,
) {
  return apiClient.put<BlogArticle>(
    `${API_ENDPOINTS.blogArticles}/${articleId}`,
    payload,
  );
}

export async function deleteBlogArticle(articleId: string | number) {
  return apiClient.delete<void>(`${API_ENDPOINTS.blogArticles}/${articleId}`);
}

export async function uploadBlogImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.postForm<{ url: string }>(API_ENDPOINTS.blogImages, formData);
}
