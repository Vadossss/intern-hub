"use client";

import { useParams } from "next/navigation";
import { Direction } from "@/components/shared/DirectionSelector";
import { ArrowLeft, Briefcase, Code, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const sections = [
  {
    id: "vacancies",
    title: "Вакансии",
    description: "Актуальные вакансии по выбранному направлению",
    icon: Briefcase,
    href: (dir: string) => `/directions/${dir}/vacancies`,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    id: "tasks",
    title: "Текстовые задания",
    description: "Практические задания для отработки навыков",
    icon: Code,
    href: (dir: string) => `/directions/${dir}/tasks`,
    color: "bg-green-50 hover:bg-green-100 border-green-200",
    iconColor: "text-green-600",
  },
  {
    id: "questions",
    title: "Вопросы с собеседований",
    description: "Типичные вопросы и ответы для подготовки",
    icon: MessageSquare,
    href: (dir: string) => `/directions/${dir}/questions`,
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    iconColor: "text-purple-600",
  },
];

export default function DirectionPage() {
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
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад на главную
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            {directionNames[direction]}
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Выберите раздел для просмотра контента
          </p>
        </div>
      </div>

      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.id} href={section.href(direction)}>
                  <Card className={`${section.color} transition-all hover:shadow-lg cursor-pointer h-full`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-3 rounded-lg bg-white ${section.iconColor}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Перейти →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
