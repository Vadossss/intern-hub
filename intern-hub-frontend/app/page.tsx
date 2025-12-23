"use client";

import { useState } from "react";
import {
  DirectionSelector,
  Direction,
} from "@/components/shared/DirectionSelector";
import { TopMainBody } from "@/components/shared/TopMainBody";
import { Briefcase, Code, MessageSquare } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSection } from "@/components/shared/main_page/CardSection";
import { useStacks } from "@/lib/hooks";

const sections = [
  {
    id: "vacancies",
    title: "Вакансии",
    description: "Актуальные вакансии по выбранному направлению",
    icon: Briefcase,
    href: (dir: string | null) => `/${dir}/jobs`,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    id: "tasks",
    title: "Тестовые задания",
    description: "Практические задания для отработки навыков",
    icon: Code,
    href: (dir: string | null) => (dir ? `/tasks?direction=${dir}` : "/"),
    color: "bg-green-50 hover:bg-green-100 border-green-200",
    iconColor: "text-green-600",
  },
  {
    id: "questions",
    title: "Вопросы с собеседований",
    description: "Типичные вопросы и ответы для подготовки",
    icon: MessageSquare,
    href: (dir: string | null) => (dir ? `/questions?direction=${dir}` : "/"),
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    id: "key-skills",
    title: "Ключевые навыки",
    description: "Необходимые навыки для трудоустройства",
    icon: MessageSquare,
    href: (dir: string | null) => (dir ? `/questions?direction=${dir}` : "/"),
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    iconColor: "text-purple-600",
  },
];

export default function Home() {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(
    "all"
  );

  return (
    <div className="min-h-screen">
      <TopMainBody />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DirectionSelector
            selectedDirection={selectedDirection}
            onDirectionChange={setSelectedDirection}
            showAllOption={true}
          />
        </div>
      </div>

      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Выберите раздел
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sections.map((section) => {
              return (
                <CardSection
                  section={section}
                  selectedDirection={selectedDirection}
                  key={section.id}
                ></CardSection>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
