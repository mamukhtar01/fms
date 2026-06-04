import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import type { Personnel, PersonnelStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

function toDomainPersonnel(record: Record<string, unknown>): Personnel {
  return {
    id: String(record.id ?? ""),
    personnelId: String(record.personnel_id ?? ""),
    fullName: String(record.full_name ?? ""),
    rank: String(record.rank ?? ""),
    position: String(record.position ?? ""),
    department: String(record.department ?? ""),
    phone: String(record.phone ?? ""),
    nationalId: String(record.national_id ?? ""),
    status: String(record.status ?? "Active") as PersonnelStatus,
    created: record.created ? String(record.created) : undefined,
    updated: record.updated ? String(record.updated) : undefined,
  };
}

export async function GET(request: Request) {
  try {
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const records = await pb.collection("personnel").getFullList<Record<string, unknown>>({
      sort: "full_name",
    });

    return NextResponse.json({ items: records.map(toDomainPersonnel) });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ message: "Unable to load personnel" }, { status: 500 });
  }
}
