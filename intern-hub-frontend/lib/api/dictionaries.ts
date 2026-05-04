import { apiClient } from "./client";
import { API_ENDPOINTS } from "./config";

export interface DictionaryItem {
  id: string;
  name: string;
  abbr?: string;
  searchQuery?: string;
}

export interface SkillOption {
  id: number;
  name: string;
}

export interface VacancyDictionaries {
  currencies: DictionaryItem[];
  employments: DictionaryItem[];
  experiences: DictionaryItem[];
  workFormats: DictionaryItem[];
  stacks: DictionaryItem[];
  skills: SkillOption[];
}

export function getCurrencies(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.currency);
}

export function getEmployments(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.employment);
}

export function getExperiences(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.experience);
}

export function getWorkFormats(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.workFormat);
}

export function getStacks(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.stack);
}

export function getSkills(): Promise<SkillOption[]> {
  return apiClient.get<SkillOption[]>(API_ENDPOINTS.skills);
}

export async function getVacancyDictionaries(): Promise<VacancyDictionaries> {
  const [currencies, employments, experiences, workFormats, stacks, skills] =
    await Promise.all([
      getCurrencies(),
      getEmployments(),
      getExperiences(),
      getWorkFormats(),
      getStacks(),
      getSkills(),
    ]);

  return {
    currencies,
    employments,
    experiences,
    workFormats,
    stacks,
    skills,
  };
}
