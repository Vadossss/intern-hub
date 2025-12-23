"use client";

import { VacancyCard, Vacancy } from "./VacancyCard";
import { Direction } from "./DirectionSelector";
import { Briefcase } from "lucide-react";

interface Props {
  vacancies: Vacancy[];
  selectedDirection: Direction | null;
  className?: string;
}

export const VacanciesSection: React.FC<Props> = ({
  vacancies,
  selectedDirection,
  className,
}) => {
  // const filteredVacancies = selectedDirection
  //   ? vacancies.filter((v) => v.direction === selectedDirection)
  //   : vacancies;

  console.log(vacancies);

  if (vacancies.length === 0) {
    return (
      <section className={className}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Вакансии</h2>
          </div>
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {selectedDirection
                ? "Нет вакансий для выбранного направления"
                : "Нет доступных вакансий"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">
            Вакансии {selectedDirection && `(${vacancies.length})`}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vacancies.map((vacancy) => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </div>
      </div>
    </section>
  );
};
