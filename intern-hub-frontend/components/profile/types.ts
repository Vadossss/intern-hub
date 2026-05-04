import type {
  CandidateApplicationHistory,
  CandidateFavoriteVacancy,
  CandidateProfile,
  EmployerApplication,
  EmployerVacancy,
} from "@/lib/api/profile";

export type RoleView = "candidate" | "employer";
export type CandidateSection = "profile" | "applications" | "favorites";
export type EmployerSection = "profile" | "vacancies" | "applications";
export type ProfileSection = CandidateSection | EmployerSection;

export interface EmployerProfile {
  companyName: string;
  email: string;
  city: string;
  website: string;
  contactName: string;
  phone: string;
  about: string;
}

export const emptyCandidate: CandidateProfile = {
  userId: 0,
  email: "user@internhub.ru",
  firstName: "Ваш",
  lastName: "профиль",
  city: "Не указан",
  about:
    "Заполните профиль, чтобы работодатели быстрее понимали ваш опыт, стек и ожидания.",
  preferredCity: "Любой город",
  preferredWorkFormat: "hybrid",
  preferredEmployment: "probation",
  expectedSalaryFrom: 0,
  expectedSalaryTo: 0,
  openToWork: true,
  skills: [],
};

export const emptyEmployer: EmployerProfile = {
  companyName: "Ваша компания",
  email: "",
  city: "Не указан",
  website: "",
  contactName: "",
  phone: "",
  about:
    "Добавьте описание компании, чтобы кандидаты понимали, чем занимается команда и какие стажировки вы предлагаете.",
};

export const demoApplications: CandidateApplicationHistory[] = [
  {
    applicationId: 1,
    vacancyPublicId: "demo-frontend",
    vacancyTitle: "Frontend intern",
    companyName: "InternHub",
    status: "PENDING",
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const demoVacancies: EmployerVacancy[] = [
  {
    id: 1,
    publicId: "demo-vacancy",
    title: "JavaScript intern",
    stack: "JavaScript",
    city: "Москва",
    status: "ACTIVE",
    salaryFrom: 40000,
    salaryTo: 70000,
    employer: { name: "Ваша компания" },
    skills: [
      { id: 1, name: "React" },
      { id: 2, name: "TypeScript" },
    ],
  },
];

export const demoEmployerApplications: EmployerApplication[] = [
  {
    applicationId: 1,
    vacancyPublicId: "demo-vacancy",
    candidateId: 1,
    candidateName: "Анна Смирнова",
    candidateEmail: "anna@example.com",
    status: "PENDING",
    coverLetter:
      "Готова пройти стажировку и развиваться в продуктовой команде.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
