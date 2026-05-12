import type {
  CandidateApplicationHistory,
  CandidateFavoriteVacancy,
  CandidateProfile,
  EmployerApplication,
  EmployerProfileData,
  EmployerVacancy,
} from "@/lib/api/profile";

export type RoleView = "candidate" | "employer" | "admin";
export type CandidateSection =
  | "profile"
  | "resumes"
  | "applications"
  | "favorites"
  | "settings";
export type EmployerSection =
  | "profile"
  | "vacancies"
  | "applications"
  | "settings";
export type AdminSection =
  | "overview"
  | "vacancies"
  | "excluded-words"
  | "users"
  | "blog"
  | "settings";
export type ProfileSection = CandidateSection | EmployerSection | AdminSection;

export type EmployerProfile = EmployerProfileData;

export const emptyCandidate: CandidateProfile = {
  userId: 0,
  email: "user@internhub.ru",
  phoneNumber: "",
  firstName: "Ваш",
  lastName: "профиль",
  birthday: "",
  city: "Не указан",
  avatarUrl: "",
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
  userId: 0,
  companyName: "Ваша компания",
  email: "",
  city: "Не указан",
  website: "",
  contactName: "",
  phone: "",
  avatarUrl: "",
  about:
    "Добавьте описание компании, чтобы кандидаты понимали, чем занимается команда и какие стажировки вы предлагаете.",
};

export const demoApplications: CandidateApplicationHistory[] = [
  {
    applicationId: 1,
    vacancyPublicId: "demo-frontend",
    vacancyTitle: "Frontend intern",
    employer: {
      id: 1,
      companyName: "InternHub",
      city: "Москва",
    },
    status: "PENDING",
    archived: false,
    appliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const demoVacancies: EmployerVacancy[] = [
  {
    id: 1,
    publicId: "demo-vacancy",
    title: "JavaScript intern",
    direction: "Разработка",
    directionId: "development",
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
