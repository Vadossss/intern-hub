"use client";

import { LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { logout as logoutRequest } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";

export function Header() {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, setUser, user } = useAuth();

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Local session is cleared anyway: logout must stay safe for expired cookies.
    }

    setIsAuthenticated(false);
    setUser(null);
    router.push("/auth");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            InternHub
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {user?.role === "ROLE_EMPLOYER" ? (
              <Link
                href="/candidates"
                className="text-foreground transition-colors hover:text-primary"
              >
                Соискатели
              </Link>
            ) : (
              <>
                <Link
                  href="/vacancies"
                  className="text-foreground transition-colors hover:text-primary"
                >
                  Вакансии
                </Link>
                <Link
                  href="/employers"
                  className="text-foreground transition-colors hover:text-primary"
                >
                  Компании
                </Link>
              </>
            )}
            <Link
              href="/blog"
              className="text-foreground transition-colors hover:text-primary"
            >
              Блог
            </Link>
            <Link
              href="/"
              className="text-foreground transition-colors hover:text-primary"
            >
              О нас
            </Link>
            <Link
              href="/"
              className="text-foreground transition-colors hover:text-primary"
            >
              Помощь
            </Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              {!isAuthenticated ? (
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/auth">Войти</Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              ) : (
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/profile">
                      <UserRound className="h-4 w-4" />
                      Профиль
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-700 focus:text-red-700"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
