import type {
  VacancyDictionaries,
  VacancyFilterOptions,
} from "@/lib/api/dictionaries";

export const emptyDictionaries: VacancyDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  stacks: [],
  skills: [],
};

export const emptyFilterOptions: VacancyFilterOptions = {
  cities: [],
  companies: [],
  sources: [],
  directions: [],
};
