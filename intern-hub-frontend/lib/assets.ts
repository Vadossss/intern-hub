import { API_CONFIG } from "@/lib/api/config";

export function resolveAssetUrl(value?: string | null) {
  if (!value) {
    return undefined;
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  return new URL(value, API_CONFIG.baseURL).toString();
}
