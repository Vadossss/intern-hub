import type {
  VacancyDictionaries,
  VacancyFilterOptions,
} from "@/lib/api/dictionaries";

export const emptyDictionaries: VacancyDictionaries = {
  currencies: [],
  employments: [],
  experiences: [],
  workFormats: [],
  directions: [],
};

export const emptyFilterOptions: VacancyFilterOptions = {
  cities: [],
  companies: [],
  sources: [],
  directions: [],
};
