"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { VacanciesSection } from "@/components/shared/VacanciesSection";
import { useVacancies } from "@/lib/hooks";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStacks } from "@/lib/hooks";

function JobsContent() {
  const params = useParams();
  const stackId = params.stack as string;
  const { stacks } = useStacks();

  const currentStack = stacks.find((s) => s.id === stackId);

  const { vacancies, loading, error } = useVacancies(
    stackId !== "all" ? { position: stackId } : undefined
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Загрузка вакансий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Ошибка: {error.message}</p>
          <Link href="/">
            <Button className="mt-4">Вернуться на главную</Button>
          </Link>
        </div>
      </div>
    );
  }

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
            {currentStack && ` - ${currentStack.name}`}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {currentStack
              ? `Актуальные вакансии по направлению ${currentStack.name}`
              : "Актуальные вакансии"}
          </p>
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <VacanciesSection vacancies={vacancies} selectedDirection={null} />
      </div>
    </div>
  );
}

export default function JobsPage() {
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
      <JobsContent />
    </Suspense>
  );
}
