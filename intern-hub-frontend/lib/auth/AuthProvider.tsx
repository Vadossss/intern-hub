"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { getCurrentUserWithRefresh } from "../api/auth";
import { useAuth as useAuthStore } from "./context";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsAuthenticated, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    function clearAuth() {
      setUser(null);
      setIsAuthenticated(false);

      if (pathname.startsWith("/profile")) {
        router.replace("/auth");
      }
    }

    async function checkAuth() {
      try {
        const user = await getCurrentUserWithRefresh();
        if (!isMounted) return;

        setUser(user);
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) return;

        clearAuth();
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    window.addEventListener("intern-hub:auth-expired", clearAuth);
    checkAuth();

    return () => {
      isMounted = false;
      window.removeEventListener("intern-hub:auth-expired", clearAuth);
    };
  }, [pathname, router, setIsAuthenticated, setUser]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
