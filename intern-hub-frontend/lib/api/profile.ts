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
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  city?: string;
  avatarUrl?: string;
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
  resumes?: CandidateResume[];
}

export interface CandidateProfileUpdate {
  firstName?: string;
  lastName?: string;
  birthday?: string;
  phoneNumber?: string;
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

export interface CandidateResume {
  id: number;
  profession?: string;
  city?: string;
  expectedSalaryFrom?: number;
  expectedSalaryTo?: number;
  employmentId?: string;
  employmentName?: string;
  workFormatId?: string;
  workFormatName?: string;
  experienceId?: string;
  experienceName?: string;
  about?: string;
  archived?: boolean;
  skills?: KeySkill[];
  languages?: CandidateResumeLanguage[];
  education?: CandidateResumeEducation[];
  workExperience?: CandidateResumeWorkExperience[];
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateResumeLanguage {
  id?: number;
  languageId?: string;
  languageName?: string;
  level?: string;
}

export interface CandidateResumeEducation {
  id?: number;
  institution?: string;
  specialty?: string;
  educationLevel?: string;
  startDate?: string;
  endDate?: string;
  currentlyStudying?: boolean;
}

export interface CandidateResumeWorkExperience {
  id?: number;
  company?: string;
  position?: string;
  workFormatId?: string;
  workFormatName?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  projectUrl?: string;
}

export interface CandidateResumeViewStats {
  resumeId: number;
  totalViews: number;
  days: number;
  chart: CandidateResumeViewPoint[];
  companies: CandidateResumeCompanyView[];
}

export interface CandidateResumeViewPoint {
  date: string;
  views: number;
}

export interface CandidateResumeCompanyView {
  employerId?: number;
  companyName?: string;
  avatarUrl?: string;
  viewedAt: string;
}

export interface CandidateResumeSearchResult {
  profileId?: number;
  userId: number;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  birthday?: string;
  city?: string;
  avatarUrl?: string;
  about?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  openToWork?: boolean;
  resume: CandidateResume;
}

export interface CandidateResumePayload {
  profession?: string;
  expectedSalaryFrom?: number | null;
  expectedSalaryTo?: number | null;
  employmentId?: string;
  workFormatId?: string;
  experienceId?: string;
  about?: string;
  skillIds?: number[];
  languages?: CandidateResumeLanguage[];
  education?: CandidateResumeEducation[];
  workExperience?: CandidateResumeWorkExperience[];
}

export interface CandidateApplicationHistory {
  applicationId: number;
  vacancyPublicId: string;
  vacancyTitle: string;
  directionId?: string;
  direction?: string;
  city?: string;
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
    id?: number;
    companyName?: string;
    city?: string;
    avatarUrl?: string;
  };
  status: string;
  archived?: boolean;
  appliedAt: string;
  updatedAt: string;
  chatId?: string | null;
}

export interface CandidateFavoriteVacancy {
  publicId: string;
  title: string;
  directionId?: string;
  direction?: string;
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
    avatarUrl?: string;
  };
}

export interface EmployerVacancy {
  id: number;
  publicId: string;
  title: string;
  directionId?: string;
  direction?: string;
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
  viewCount?: number;
}

export interface VacancyContact {
  chosenContactMethod: string;
  contactValue: string;
  hint?: string;
}

export interface VacancyPayload {
  title: string;
  direction?: string;
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

export interface EmployerProfileData {
  userId?: number;
  email?: string;
  companyName?: string;
  city?: string;
  website?: string;
  contactName?: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
  aggregated?: boolean;
  accredited?: boolean;
  verified?: boolean;
  verificationStatus?: string;
}

export interface EmployerProfileUpdate {
  companyName?: string;
  city?: string;
  website?: string;
  contactName?: string;
  phone?: string;
  about?: string;
  avatarUrl?: string;
}

export interface EmployerApplication {
  applicationId: number;
  vacancyPublicId: string;
  candidateId: number;
  candidateName?: string | null;
  candidateEmail: string;
  status: string;
  archived?: boolean;
  coverLetter?: string;
  resumeUrl?: string;
  resumeId?: number;
  resumeProfession?: string;
  chosenContactMethod?: string;
  createdAt: string;
  updatedAt: string;
  chatId?: string | null;
}

export interface EmployerCandidateSearchParams {
  query?: string;
  city?: string;
  skillIds?: number[];
  page?: number;
  size?: number;
}

export function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>(API_ENDPOINTS.userProfile);
}

export function updateCandidateProfile(
  data: CandidateProfileUpdate,
): Promise<CandidateProfile> {
  return apiClient.put<CandidateProfile>(API_ENDPOINTS.userProfile, data);
}

export async function uploadCandidateProfilePhoto(
  file: File,
): Promise<CandidateProfile> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.postForm<CandidateProfile>(
    API_ENDPOINTS.userProfilePhoto,
    formData,
  );
}

export function getCandidateResumes(): Promise<CandidateResume[]> {
  return apiClient.get<CandidateResume[]>(API_ENDPOINTS.userResumes);
}

export function createCandidateResume(
  data: CandidateResumePayload,
): Promise<CandidateResume> {
  return apiClient.post<CandidateResume>(API_ENDPOINTS.userResumes, data);
}

export function updateCandidateResume(
  resumeId: number,
  data: CandidateResumePayload,
): Promise<CandidateResume> {
  return apiClient.put<CandidateResume>(
    `${API_ENDPOINTS.userResumes}/${resumeId}`,
    data,
  );
}

export function archiveCandidateResume(
  resumeId: number,
): Promise<CandidateResume> {
  return apiClient.patch<CandidateResume>(
    `${API_ENDPOINTS.userResumes}/${resumeId}/archive`,
  );
}

export function restoreCandidateResume(
  resumeId: number,
): Promise<CandidateResume> {
  return apiClient.patch<CandidateResume>(
    `${API_ENDPOINTS.userResumes}/${resumeId}/restore`,
  );
}

export function deleteCandidateResume(resumeId: number): Promise<void> {
  return apiClient.delete<void>(`${API_ENDPOINTS.userResumes}/${resumeId}`);
}

export function getCandidateResumeViewStats(
  resumeId: number,
  days = 30,
): Promise<CandidateResumeViewStats> {
  return apiClient.get<CandidateResumeViewStats>(
    `${API_ENDPOINTS.userResumes}/${resumeId}/view-stats`,
    {
      params: { days },
    },
  );
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

export function addCandidateFavorite(publicId: string): Promise<void> {
  return apiClient.post<void>(
    `${API_ENDPOINTS.userFavoriteVacancies}/${encodeURIComponent(publicId)}`,
  );
}

export function removeCandidateFavorite(publicId: string): Promise<void> {
  return apiClient.delete<void>(
    `${API_ENDPOINTS.userFavoriteVacancies}/${encodeURIComponent(publicId)}`,
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

export function getEmployerProfile(): Promise<EmployerProfileData> {
  return apiClient.get<EmployerProfileData>(API_ENDPOINTS.employerProfile);
}

export function updateEmployerProfile(
  data: EmployerProfileUpdate,
): Promise<EmployerProfileData> {
  return apiClient.put<EmployerProfileData>(
    API_ENDPOINTS.employerProfile,
    data,
  );
}

export async function uploadEmployerProfilePhoto(
  file: File,
): Promise<EmployerProfileData> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient.postForm<EmployerProfileData>(
    API_ENDPOINTS.employerProfilePhoto,
    formData,
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

export function searchEmployerCandidates({
  query,
  city,
  skillIds,
  page = 0,
  size = 10,
}: EmployerCandidateSearchParams): Promise<
  PageResponse<CandidateResumeSearchResult>
> {
  return apiClient.get<PageResponse<CandidateResumeSearchResult>>(
    API_ENDPOINTS.employerCandidates,
    {
      params: {
        query,
        city,
        skill_ids: skillIds?.length ? skillIds : undefined,
        page,
        size,
      },
    },
  );
}

export function recordCandidateResumeView(resumeId: number): Promise<void> {
  return apiClient.post<void>(
    `${API_ENDPOINTS.employerCandidates}/resumes/${resumeId}/view`,
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

export function restoreVacancy(publicId: string): Promise<void> {
  return apiClient.patch<void>(
    `${API_ENDPOINTS.vacancies}/${publicId}/restore`,
  );
}

export function deleteVacancy(publicId: string): Promise<void> {
  return apiClient.delete<void>(`${API_ENDPOINTS.vacancies}/${publicId}`);
}
