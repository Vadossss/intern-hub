"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

function VacanciesContent() {
  const searchParams = useSearchParams();
  const directionParam = searchParams.get("direction");
  const selectedDirection =
    directionParam && Object.keys(directionNames).includes(directionParam)
      ? (directionParam as Direction)
      : null;

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад на главную
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            Вакансии
            {selectedDirection && ` - ${directionNames[selectedDirection]}`}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {selectedDirection
              ? `Актуальные вакансии по направлению ${directionNames[selectedDirection]}`
              : "Актуальные вакансии по всем направлениям"}
          </p>
        </div>
      </div>

      {/* <div className="py-12 bg-gray-50">
        <VacanciesSection
          vacancies={mockVacancies}
          selectedDirection={selectedDirection}
        />
      </div> */}
    </div>
  );
}

export default function VacanciesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">Загрузка...</p>
          </div>
        </div>
      }
    >
      <VacanciesContent />
    </Suspense>
  );
}
