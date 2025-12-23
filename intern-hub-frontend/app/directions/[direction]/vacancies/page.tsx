"use client";

import { useParams } from "next/navigation";
import { Direction } from "@/components/shared/DirectionSelector";
import { VacanciesSection } from "@/components/shared/VacanciesSection";
// import { mockVacancies } from "@/components/shared/mockData";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const directionNames: Record<Direction, string> = {
  java: "Java",
  javascript: "JavaScript",
  python: "Python",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  kotlin: "Kotlin",
};

export default function VacanciesPage() {
  const params = useParams();
  const direction = params.direction as Direction;

  if (!direction || !directionNames[direction]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Направление не найдено</h1>
          <Link href="/">
            <Button>Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/directions/${direction}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к разделам
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Вакансии - {directionNames[direction]}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Актуальные вакансии по выбранному направлению
          </p>
        </div>
      </div>

      {/* <div className="py-12 bg-gray-50">
        <VacanciesSection
          vacancies={mockVacancies}
          selectedDirection={direction}
        />
      </div> */}
    </div>
  );
}
