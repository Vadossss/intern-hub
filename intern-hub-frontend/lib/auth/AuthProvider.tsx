"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUserWithRefresh } from "../api/auth";
import { useAuth as useAuthStore } from "./context";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const { setIsAuthenticated, setIsCheckingAuth, setUser } = useAuthStore();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;

    function clearAuth() {
      setUser(null);
      setIsAuthenticated(false);
      setIsCheckingAuth(false);

      if (pathnameRef.current.startsWith("/profile")) {
        router.replace("/auth");
      }
    }

    async function checkAuthOnce() {
      try {
        setIsCheckingAuth(true);
        const user = await getCurrentUserWithRefresh();
        if (!isMounted) return;

        setUser(user);
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) return;

        clearAuth();
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    window.addEventListener("intern-hub:auth-expired", clearAuth);
    checkAuthOnce();

    return () => {
      isMounted = false;
      window.removeEventListener("intern-hub:auth-expired", clearAuth);
    };
  }, [router, setIsAuthenticated, setIsCheckingAuth, setUser]);

  return <>{children}</>;
}
