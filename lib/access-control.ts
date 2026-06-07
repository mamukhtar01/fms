import { pb } from "@/lib/pb";
import type { UserRole } from "@/types/domain";

export const ROLE_COOKIE = "safms_role";

export function getCurrentRole(): UserRole | null {
  const role = pb.authStore.record?.role as string | undefined;
  if (role === "ADMIN" || role === "OFFICER") return role as UserRole;
  return null;
}

export function canManageUsers(): boolean {
  return getCurrentRole() === "ADMIN";
}
