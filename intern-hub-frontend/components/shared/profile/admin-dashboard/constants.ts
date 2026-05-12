import type { AdminUserRole } from "@/lib/api/admin";

export const roleOptions: { value: AdminUserRole; label: string }[] = [
  { value: "ROLE_USER", label: "Соискатель" },
  { value: "ROLE_EMPLOYER", label: "Работодатель" },
  { value: "ROLE_ADMIN", label: "Администратор" },
];
