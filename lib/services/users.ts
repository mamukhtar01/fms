import { pb } from "@/lib/pb";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import type { User, UserRole } from "@/types/domain";
import { ClientResponseError } from "pocketbase";

function toDomainUser(record: Record<string, unknown>): User {
  return {
    id: String(record.id ?? ""),
    email: String(record.email ?? ""),
    name: String(record.name ?? ""),
    username: String(record.username ?? ""),
    role: String(record.role ?? "OFFICER") as UserRole,
    verified: record.verified === true,
    avatar: record.avatar ? String(record.avatar) : undefined,
  };
}

export async function getUsers(): Promise<User[]> {
  try {
    const records = await pb.collection("users").getFullList<Record<string, unknown>>({
      sort: "name",
      fields: "id,email,name,username,role,verified,avatar",
    });
    return records.map(toDomainUser);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}
