export enum VacancySource {
  HH = "HH",
  SJ = "SJ",
  IH = "IH",
}

export enum Position {
  JAVASCRIPT = "JAVASCRIPT",
  JAVA = "JAVA",
  PYTHON = "PYTHON",
  CSHARP = "CSHARP",
  DATASCIENCE = "DATASCIENCE",
  GO = "GO",
  QA = "QA",
  DESIGN = "DESIGN",
}

export enum VacancyStatus {
  ACTIVE = "ACTIVE",
  MODERATED = "MODERATED",
  ARCHIVED = "ARCHIVED",
}

export enum WorkFormat {
  REMOTE = "remote",
  OFFICE = "office",
  HYBRID = "hybrid",
  UNKNOWN = "unknown",
}

export enum Employment {
  FULL = "full",
  PART = "part",
  PROJECT = "project",
  PROBATION = "probation",
}

export enum Experience {
  NO_EXPERIENCE = "noExperience",
  BETWEEN_1_AND_3 = "between1And3",
  BETWEEN_3_AND_6 = "between3And6",
  MORE_THAN_6 = "moreThan6",
}

export enum ContactMethod {
  INTERNAL_CHAT = "INTERNAL_CHAT",
  EXTERNAL_LINK = "EXTERNAL_LINK",
  HH = "HH",
  SJ = "SJ",
  TELEGRAM = "TELEGRAM",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Salary {
  from?: number;
  to?: number;
  currency?: string;
}

export interface Currency {
  id: string;
  name: string;
  abbr: string;
}

export interface EmploymentType {
  id: string;
  name: string;
}

export interface ExperienceType {
  id: string;
  name: string;
}

export interface WorkFormatType {
  id: string;
  name: string;
}

export interface Stack {
  id: string;
  name: string;
  searchQuery: string;
}

export interface KeySkill {
  id: number;
  name: string;
}

export interface VacancyContact {
  chosenContactMethod: ContactMethod;
  contactValue: string;
  hint?: string;
}

export interface Employer {
  id?: string | number;
  companyName?: string;
  avatarUrl?: string;
  city?: string;
  isAggregated: boolean;
  verified: boolean;
  verificationStatus?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VacancyResponseDto {
  id: number;
  publicId: string;
  title: string;
  stack: string;
  description: string;
  city: string;
  status: VacancyStatus;
  salaryFrom?: number;
  salaryTo?: number;
  currency?: Currency;
  employment?: EmploymentType;
  experience?: ExperienceType;
  workFormat?: WorkFormatType;
  employer?: Employer;
  skills?: KeySkill[];
  contacts?: VacancyContact[];
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

export interface SearchVacanciesParams {
  source?: VacancySource[];
  position?: Position;
  companyName?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  searchText?: string;
  status?: VacancyStatus;
  workFormats?: WorkFormat[];
  employment?: Employment[];
  experience?: Experience[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface NewVacancyDto {
  title: string;
  stack: string;
  description: string;
  salary?: Salary;
  city: string;
  link?: string;
  employment: string;
  experience: string;
  workFormat: string;
  skills?: number[];
  contactsList: VacancyContact[];
}

export interface ApplyRequestDto {
  coverLetter?: string;
  resumeUrl?: string;
  resumeId?: number;
  chosenContactMethod: ContactMethod;
}

export interface ApplicationDto {
  id: number;
  vacancyPublicId: string;
  userId: number;
  status: string;
  resumeId?: number;
}

export interface ApplicationStatusDto {
  applied: boolean;
  applicationId?: number;
  status?: string;
  resumeId?: number;
}

export interface UserRegisterDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}
