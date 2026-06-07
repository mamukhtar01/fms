import { pb } from "@/lib/pb";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import type { UserRole } from "@/types/domain";
import { ClientResponseError } from "pocketbase";

export async function login(email: string, password: string): Promise<void> {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password);
    const role = authData.record.role as string | undefined;
    if (role !== "ADMIN" && role !== "OFFICER") {
      pb.authStore.clear();
      throw new Error("Invalid user role configuration");
    }
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export function logout(): void {
  pb.authStore.clear();
}

export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

export function getCurrentRole(): UserRole | null {
  const role = pb.authStore.record?.role as string | undefined;
  if (role === "ADMIN" || role === "OFFICER") return role as UserRole;
  return null;
}
