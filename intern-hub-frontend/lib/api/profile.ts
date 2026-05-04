import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export type UserRole = "ROLE_USER" | "ROLE_EMPLOYER" | "ROLE_ADMIN";

export interface KeySkill {
  id: number;
  name: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CandidateProfile {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  about?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  preferredCity?: string;
  preferredWorkFormat?: string;
  preferredEmployment?: string;
  expectedSalaryFrom?: number;
  expectedSalaryTo?: number;
  openToWork?: boolean;
  skills?: KeySkill[];
}

export interface CandidateProfileUpdate {
  firstName?: string;
  lastName?: string;
  city?: string;
  about?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  preferredCity?: string;
  preferredWorkFormat?: string;
  preferredEmployment?: string;
  expectedSalaryFrom?: number | null;
  expectedSalaryTo?: number | null;
  openToWork?: boolean;
  skillIds?: number[];
}

export interface CandidateApplicationHistory {
  applicationId: number;
  vacancyPublicId: string;
  vacancyTitle: string;
  companyName: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

export interface CandidateFavoriteVacancy {
  publicId: string;
  title: string;
  stack?: string;
  city?: string;
  status?: string;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: {
    id?: string;
    name?: string;
    abbr?: string;
  };
  employment?: {
    id?: string;
    name?: string;
  };
  experience?: {
    id?: string;
    name?: string;
  };
  workFormat?: {
    id?: string;
    name?: string;
  };
  employer?: {
    id?: string;
    companyName?: string;
    city?: string;
  };
}

export interface EmployerVacancy {
  id: number;
  publicId: string;
  title: string;
  stack?: string;
  description?: string;
  city?: string;
  status?: string;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: {
    id?: string;
    name?: string;
    abbr?: string;
  };
  employment?: {
    id?: string;
    name?: string;
  };
  experience?: {
    id?: string;
    name?: string;
  };
  workFormat?: {
    id?: string;
    name?: string;
  };
  employer?: {
    id?: string;
    name?: string;
    alternate_url?: string;
  };
  skills?: KeySkill[];
  contacts?: VacancyContact[];
}

export interface VacancyContact {
  chosenContactMethod: string;
  contactValue: string;
  hint?: string;
}

export interface VacancyPayload {
  title: string;
  stack?: string;
  description?: string;
  salary?: {
    from?: number | null;
    to?: number | null;
    currency?: string;
  };
  city?: string;
  link?: string;
  employment?: string;
  experience?: string;
  workFormat?: string;
  skills?: number[];
  contactsList?: VacancyContact[];
}

export interface EmployerApplication {
  applicationId: number;
  vacancyPublicId: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  status: string;
  coverLetter?: string;
  resumeUrl?: string;
  chosenContactMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>(API_ENDPOINTS.userProfile);
}

export function updateCandidateProfile(
  data: CandidateProfileUpdate,
): Promise<CandidateProfile> {
  return apiClient.put<CandidateProfile>(API_ENDPOINTS.userProfile, data);
}

export function getCandidateApplications(
  page = 0,
  size = 20,
): Promise<PageResponse<CandidateApplicationHistory>> {
  return apiClient.get<PageResponse<CandidateApplicationHistory>>(
    API_ENDPOINTS.userApplicationsHistory,
    {
      params: { page, size },
    },
  );
}

export function getCandidateFavorites(
  page = 0,
  size = 20,
): Promise<PageResponse<CandidateFavoriteVacancy>> {
  return apiClient.get<PageResponse<CandidateFavoriteVacancy>>(
    API_ENDPOINTS.userVacanciesFavorite,
    {
      params: { page, size },
    },
  );
}

export function getEmployerVacancies(
  page = 0,
  size = 20,
): Promise<PageResponse<EmployerVacancy>> {
  return apiClient.get<PageResponse<EmployerVacancy>>(
    API_ENDPOINTS.employerVacancies,
    {
      params: { page, size },
    },
  );
}

export function getEmployerVacancyApplications(
  vacancyPublicId: string,
  page = 0,
  size = 20,
): Promise<PageResponse<EmployerApplication>> {
  return apiClient.get<PageResponse<EmployerApplication>>(
    `${API_ENDPOINTS.employerVacancies}/${vacancyPublicId}/applications`,
    {
      params: { page, size },
    },
  );
}

export function getCandidateProfileById(
  userId: number,
): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>(
    `/api/employer/me/candidates/${userId}/profile`,
  );
}

export function updateEmployerApplicationStatus(
  applicationId: number,
  status: "ACCEPTED" | "REJECTED" | "PENDING",
): Promise<EmployerApplication> {
  return apiClient.patch<EmployerApplication>(
    `${API_ENDPOINTS.employerApplications}/${applicationId}/status`,
    { status },
  );
}

export function createVacancy(data: VacancyPayload): Promise<EmployerVacancy> {
  return apiClient.post<EmployerVacancy>(API_ENDPOINTS.vacancies, data);
}

export function getVacancy(publicId: string): Promise<EmployerVacancy> {
  return apiClient.get<EmployerVacancy>(
    `${API_ENDPOINTS.vacancies}/${publicId}`,
  );
}

export function updateEmployerVacancy(
  publicId: string,
  data: VacancyPayload,
): Promise<EmployerVacancy> {
  return apiClient.put<EmployerVacancy>(
    `${API_ENDPOINTS.employerVacancies}/${publicId}`,
    data,
  );
}

export function archiveVacancy(publicId: string): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.vacancies}/${publicId}/archive`,
  );
}

export function deleteVacancy(publicId: string): Promise<void> {
  return apiClient.delete<void>(`${API_ENDPOINTS.vacancies}/${publicId}`);
}
