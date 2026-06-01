import { cookies } from "next/headers";
import type { UserRole } from "@/types/domain";

export const ROLE_COOKIE = "safms_role";

export async function getCurrentRole(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(ROLE_COOKIE)?.value;
  if (role === "ADMIN" || role === "OFFICER") return role;
  return null;
}

export async function canManageUsers(): Promise<boolean> {
  return (await getCurrentRole()) === "ADMIN";
}
