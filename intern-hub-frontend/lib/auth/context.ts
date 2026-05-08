import { create } from "zustand";

export type UserRole = "ROLE_USER" | "ROLE_EMPLOYER" | "ROLE_ADMIN";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  phoneNumber?: string | null;
  city?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
  verified?: boolean | null;
  verificationStatus?: string | null;
  verifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  user: null,
  setUser: (user) => set({ user }),
}));

export const useAuthStore = useAuth.getState();
