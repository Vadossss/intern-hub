import { API_CONFIG, API_ENDPOINTS } from "./config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

interface RequestOptions extends RequestInit {
  params?: Record<string, QueryValue>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, QueryValue>,
  ): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach((item) => {
            url.searchParams.append(key, String(item));
          });
          return;
        }

        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    options: RequestOptions = {},
    hasRetriedAuth = false,
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const { headers: customHeaders, ...restOptions } = fetchOptions;
    const url = this.buildURL(endpoint, params);
    const isFormData =
      typeof FormData !== "undefined" && restOptions.body instanceof FormData;
    const headers = new Headers(customHeaders);

    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const config: RequestInit = {
      method,
      credentials: "include",
      ...restOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await this.buildApiError(response);

        if (this.shouldRefreshAuth(endpoint, error.status, hasRetriedAuth)) {
          const refreshed = await this.refreshAuth();

          if (refreshed) {
            return this.request<T>(endpoint, method, options, true);
          }

          this.notifyAuthExpired();
        }

        throw error;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  private async buildApiError(response: Response): Promise<ApiError> {
    let errorData;
    try {
      errorData = await response.clone().json();
    } catch {
      errorData = await response.text();
    }

    return new ApiError(response.status, response.statusText, errorData);
  }

  private shouldRefreshAuth(
    endpoint: string,
    status: number,
    hasRetriedAuth: boolean,
  ) {
    if (hasRetriedAuth || (status !== 401 && status !== 403)) {
      return false;
    }

    const excludedEndpoints: string[] = [
      API_ENDPOINTS.login,
      API_ENDPOINTS.refreshToken,
      API_ENDPOINTS.logout,
    ];

    return !excludedEndpoints.includes(endpoint);
  }

  private async refreshAuth(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = fetch(this.buildURL(API_ENDPOINTS.refreshToken), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.ok)
        .catch(() => false)
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private notifyAuthExpired() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("intern-hub:auth-expired"));
    }
  }

  /**
   * GET запрос
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "GET", options);
  }

  /**
   * POST запрос
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "POST", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  async postForm<T>(
    endpoint: string,
    data: FormData,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "POST", {
      ...options,
      body: data,
    });
  }

  /**
   * PUT запрос
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "PUT", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH запрос
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, "PATCH", {
      ...options,
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE запрос
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, "DELETE", options);
  }
}

export const apiClient = new ApiClient(API_CONFIG.baseURL);
