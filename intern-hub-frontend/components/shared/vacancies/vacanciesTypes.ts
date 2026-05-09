export interface VacancyFilters {
  source: string[];
  direction: string[];
  companyName: string;
  city: string;
  salaryMin: string;
  salaryMax: string;
  searchText: string;
  workFormats: string[];
  employment: string[];
  experience: string[];
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

export interface SearchParamsLike {
  get(name: string): string | null;
  getAll(name: string): string[];
}
