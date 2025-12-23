import {
  Briefcase,
  GraduationCap,
  FileCode,
  MessageCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const resources = [
  {
    id: "vacancies",
    title: "Вакансии / Стажировки",
    icon: Briefcase,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    description: "Актуальные предложения от компаний",
    count: "2,340",
    badge: "Обновляется каждый час",
    isNew: false,
  },
  {
    id: "skills",
    title: "Необходимые навыки",
    icon: GraduationCap,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50",
    description: "Что нужно знать для старта",
    count: "120+",
    badge: "Roadmap",
    isNew: false,
  },
  {
    id: "tests",
    title: "Тестовые задания",
    icon: FileCode,
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50",
    description: "Реальные задачи с разборами",
    count: "500+",
    badge: "С решениями",
    isNew: true,
  },
  {
    id: "interviews",
    title: "Собеседования",
    icon: MessageCircle,
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50",
    description: "Вопросы и ответы",
    count: "1,000+",
    badge: "Подготовка",
    isNew: false,
  },
  {
    id: "projects",
    title: "Пет-проекты",
    icon: Lightbulb,
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "from-pink-50 to-rose-50",
    description: "Идеи для портфолио",
    count: "300+",
    badge: "Вдохновение",
    isNew: false,
  },
  {
    id: "resources",
    title: "Полезные ресурсы",
    icon: BookOpen,
    gradient: "from-indigo-500 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50",
    description: "Курсы, статьи, инструменты",
    count: "800+",
    badge: "Обучение",
    isNew: false,
  },
];

export const CategoryTabs = () => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-5 mb-5 m-auto max-w-7xl px-4">
      {resources.map((vacancie) => (
        <Link
          href={"/"}
          key={vacancie.id}
          className="rounded-xl flex flex-col shadow-sm bg-white p-4 hover:scale-105 ease-in-out duration-200 hover:shadow-lg"
        >
          <p className="font-bold text-xl">{vacancie.title}</p>
          <p className="text-gray-600">{vacancie.description}</p>
        </Link>
      ))}
    </div>
  );
};
