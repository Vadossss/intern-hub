"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminUserRole } from "@/lib/api/admin";

import { roleOptions } from "./constants";
import { AdminHeader } from "./AdminHeader";
import { AdminPanel } from "./AdminPanel";

export function UsersSection({
  blockReason,
  blockUntil,
  isSaving,
  selectedRole,
  userId,
  onBlock,
  onBlockReasonChange,
  onBlockUntilChange,
  onRoleChange,
  onRoleSubmit,
  onUnblock,
  onUserIdChange,
}: {
  blockReason: string;
  blockUntil: string;
  isSaving: boolean;
  selectedRole: AdminUserRole;
  userId: string;
  onBlock: () => void;
  onBlockReasonChange: (value: string) => void;
  onBlockUntilChange: (value: string) => void;
  onRoleChange: (value: AdminUserRole) => void;
  onRoleSubmit: () => void;
  onUnblock: () => void;
  onUserIdChange: (value: string) => void;
}) {
  return (
    <section className="space-y-6">
      <AdminHeader
        eyebrow="Пользователи"
        title="Роли и блокировки"
        description="Управляйте доступом пользователей по ID: меняйте роль, блокируйте и разблокируйте аккаунты."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel title="Смена роли">
          <div className="space-y-3">
            <Input
              type="number"
              min={1}
              value={userId}
              placeholder="ID пользователя"
              className="rounded-xl border-[#161616]/15"
              onChange={(event) => onUserIdChange(event.target.value)}
            />
            <select
              value={selectedRole}
              className="h-10 w-full rounded-xl border border-[#161616]/15 bg-white px-3 text-sm font-medium"
              onChange={(event) => onRoleChange(event.target.value as AdminUserRole)}
            >
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <Button
              type="button"
              className="w-full rounded-xl bg-[#171717] text-white"
              disabled={isSaving}
              onClick={onRoleSubmit}
            >
              Обновить роль
            </Button>
          </div>
        </AdminPanel>

        <AdminPanel title="Блокировка аккаунта">
          <div className="space-y-3">
            <Input
              value={blockReason}
              placeholder="Причина блокировки"
              className="rounded-xl border-[#161616]/15"
              onChange={(event) => onBlockReasonChange(event.target.value)}
            />
            <Input
              type="datetime-local"
              value={blockUntil}
              className="rounded-xl border-[#161616]/15"
              onChange={(event) => onBlockUntilChange(event.target.value)}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-red-200 bg-white text-red-700 hover:bg-red-50"
                disabled={isSaving}
                onClick={onBlock}
              >
                Заблокировать
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl bg-white"
                disabled={isSaving}
                onClick={onUnblock}
              >
                Разблокировать
              </Button>
            </div>
          </div>
        </AdminPanel>
      </div>
    </section>
  );
}
