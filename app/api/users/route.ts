import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import type { User, UserRole } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  try {
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const records = await pb.collection("users").getFullList<Record<string, unknown>>({
      sort: "name",
      fields: "id,email,name,username,role,verified,avatar",
    });

    return NextResponse.json({ items: records.map(toDomainUser) });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ message: "Unable to load users" }, { status: 500 });
  }
}
