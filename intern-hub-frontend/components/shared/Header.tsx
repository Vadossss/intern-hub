"use client";

import { useEffect, useState } from "react";
import { LogOut, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { ChatDrawer } from "@/components/shared/chat/ChatDrawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout as logoutRequest } from "@/lib/api/auth";
import { getChats } from "@/lib/api/chats";
import { useAuth } from "@/lib/auth/context";
import { resolveAssetUrl } from "@/lib/assets";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isCheckingAuth,
    setIsAuthenticated,
    setIsCheckingAuth,
    setUser,
    user,
  } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [initialChatId, setInitialChatId] = useState<string | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const avatarUrl = resolveAssetUrl(user?.avatarUrl);
  const avatarLabel =
    user?.companyName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Профиль";

  useEffect(() => {
    function openChat(event: Event) {
      const detail = (event as CustomEvent<{ chatId?: string }>).detail;
      setInitialChatId(detail?.chatId ?? null);
      setChatOpen(true);
    }

    window.addEventListener("intern-hub:open-chat", openChat);

    return () => {
      window.removeEventListener("intern-hub:open-chat", openChat);
    };
  }, []);

  useEffect(() => {
    setChatOpen(false);
    setInitialChatId(null);
  }, [pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadChatCount(0);
      return;
    }

    let active = true;

    function syncUnreadCount(count: number) {
      if (active) {
        setUnreadChatCount(count);
      }
    }

    function handleUnreadCount(event: Event) {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      syncUnreadCount(detail?.count ?? 0);
    }

    getChats()
      .then((rooms) => {
        syncUnreadCount(
          rooms.filter((room) => (room.unreadCount ?? 0) > 0).length,
        );
      })
      .catch((error) => {
        console.warn("Failed to load chat unread count:", error);
      });

    window.addEventListener("intern-hub:chat-unread-count", handleUnreadCount);

    return () => {
      active = false;
      window.removeEventListener(
        "intern-hub:chat-unread-count",
        handleUnreadCount,
      );
    };
  }, [isAuthenticated]);

  async function logout() {
    try {
      await logoutRequest();
    } catch {
      // Local session is cleared anyway: logout must stay safe for expired cookies.
    }

    setIsAuthenticated(false);
    setIsCheckingAuth(false);
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

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                className="relative h-10 w-10 rounded-xl p-0"
                aria-label="Открыть чаты"
                onClick={() => {
                  setInitialChatId(null);
                  setChatOpen(true);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                {unreadChatCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-[#0b63f6] px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                    {unreadChatCount > 99 ? "99+" : unreadChatCount}
                  </span>
                ) : null}
              </Button>
            ) : null}

            {isCheckingAuth ? (
              <div
                className="h-10 w-10 animate-pulse rounded-full bg-[#edf3ff]"
                aria-label="Проверяем авторизацию"
              />
            ) : !isAuthenticated ? (
              <Button asChild className="rounded-xl px-5">
                <Link href="/auth">Войти</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 w-10 rounded-full p-0"
                    aria-label="Открыть меню пользователя"
                  >
                    <Avatar className="h-10 w-10 border border-[#161616]/10">
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={avatarLabel}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-[#edf3ff] text-[#0b63f6]">
                        <UserRound className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      {isAuthenticated ? (
        <ChatDrawer
          open={chatOpen}
          onOpenChange={setChatOpen}
          initialChatId={initialChatId}
          onUnreadCountChange={setUnreadChatCount}
        />
      ) : null}
    </header>
  );
}
