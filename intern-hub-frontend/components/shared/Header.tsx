"use client";

import { Briefcase, User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  return (
    <header className="bg-white shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <a href="/">
              <h1 className="text-2xl font-bold">InternHub</h1>
            </a>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Стажировки
            </a>
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Компании
            </a>
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              О нас
            </a>
            <a
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Помощь
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {/* <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="w-4 h-4 mr-2" />
              Для студентов
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Briefcase className="w-4 h-4 mr-2" />
              Для работодателей
            </Button> */}
            {!isAuthenticated ? (
              <Link
                href={"/auth"}
                className="border rounded-md p-1 px-2 hover:bg-gray-100 ease-in-out duration-250"
              >
                Войти
              </Link>
            ) : (
              <Link
                href={"/profile"}
                className="border rounded-md p-1 px-2 hover:bg-gray-100 ease-in-out duration-250"
              >
                Профиль
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
