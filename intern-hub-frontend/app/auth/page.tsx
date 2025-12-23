"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function AuthPage() {
  const [isUserType, setIsUserType] = useState(false);
  const [userType, setUserType] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { accessToken, loading, error, login: performLogin } = useAuth();
  return (
    <div className="max-w-7xl mx-auto h-screen flex items-center justify-center">
      <div className={cn(`p-4 bg-white shadow-md border rounded-md`)}>
        {!isUserType ? (
          <div className="flex flex-col gap-3">
            <div
              className={cn(
                `border rounded-xl flex flex-col p-4`,
                userType == "user" && `border-blue-600`
              )}
              onClick={() => setUserType("user")}
            >
              <p>Я ищу работу</p>
              <span>Создать профиль соискателя</span>
            </div>
            <div
              className={cn(
                `border rounded-xl flex flex-col p-4`,
                userType == "employer" && `border-blue-600`
              )}
              onClick={() => setUserType("employer")}
            >
              <p>Я ищу работников</p>
              <span>Создать профиль работодателя</span>
            </div>
            <Link
              onClick={() => setIsUserType(true)}
              href={`/auth?role=${userType}`}
            >
              <Button className="w-full">Войти</Button>
            </Link>
            <Link
              onClick={() => setIsUserType(true)}
              href={`/auth?role=${userType}`}
            >
              <Button className="w-full">Зарегистрироваться</Button>
            </Link>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await performLogin({ email, password });
            }}
          >
            <div className="flex flex-col justify-center items-center gap-3">
              <p>Вход</p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
              />
              {error && <p className="text-red-500 text-sm">{error.message}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Вход..." : "Войти"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
