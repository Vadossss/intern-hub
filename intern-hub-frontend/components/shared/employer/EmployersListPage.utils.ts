import type { PublicEmployerProfile } from "@/lib/api/employers";

export function numberParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function getEmployerKey(employer: PublicEmployerProfile) {
  return getEmployerPublicId(employer) || employer.companyName || employer.email || "employer";
}

export function getEmployerPublicId(employer: PublicEmployerProfile) {
  const id = employer.userId ?? employer.id;
  return id === undefined || id === null ? "" : String(id);
}
