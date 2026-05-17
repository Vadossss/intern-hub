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
  directions: DictionaryItem[];
}

export interface VacancyFormDictionaries extends VacancyDictionaries {
  skills: SkillOption[];
  languages: DictionaryItem[];
}

export interface VacancyFilterOptions {
  cities: string[];
  companies: string[];
  sources: DictionaryItem[];
  directions: DictionaryItem[];
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

export function getLanguages(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.languages);
}

export function getVacancyDirections(): Promise<DictionaryItem[]> {
  return apiClient.get<DictionaryItem[]>(API_ENDPOINTS.vacancyDirections);
}

export function getSkills(): Promise<SkillOption[]> {
  return apiClient.get<SkillOption[]>(API_ENDPOINTS.skills);
}

export function getVacancyFilterOptions(): Promise<VacancyFilterOptions> {
  return apiClient.get<VacancyFilterOptions>(API_ENDPOINTS.vacancyFilters);
}

export async function getVacancyDictionaries(): Promise<VacancyDictionaries> {
  const [currencies, employments, experiences, workFormats, directions] =
    await Promise.all([
      getCurrencies(),
      getEmployments(),
      getExperiences(),
      getWorkFormats(),
      getVacancyDirections(),
    ]);

  return {
    currencies,
    employments,
    experiences,
    workFormats,
    directions,
  };
}

export async function getVacancyFormDictionaries(): Promise<VacancyFormDictionaries> {
  const [dictionaries, skills, languages] = await Promise.all([
    getVacancyDictionaries(),
    getSkills(),
    getLanguages(),
  ]);

  return {
    ...dictionaries,
    skills,
    languages,
  };
}
