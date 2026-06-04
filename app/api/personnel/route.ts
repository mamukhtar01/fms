import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainPersonnel } from "@/lib/mappers/personnel";
import type { PersonnelStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

interface PersonnelCreatePayload {
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  nationalId?: string;
  status: PersonnelStatus;
}

export async function GET(request: Request) {
  try {
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Match firearms list fetch: sort by record id (always present). Sorting on custom
    // text fields can fail if the field name differs in PocketBase or rules block the query.
    const records = await pb.collection("personnel").getFullList<Record<string, unknown>>({
      sort: "-id",
    });

    return NextResponse.json({ items: records.map(toDomainPersonnel) });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error("GET /api/personnel failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("GET /api/personnel failed", error);
    return NextResponse.json({ message: "Unable to load personnel" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PersonnelCreatePayload;

    const requiredFields: Array<keyof PersonnelCreatePayload> = [
      "personnelId",
      "fullName",
      "rank",
      "position",
      "department",
      "phone",
      "status",
    ];

    const missingField = requiredFields.find((field) => !body[field]);
    if (missingField) {
      return NextResponse.json({ message: `${missingField} is required` }, { status: 400 });
    }

    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const created = await pb.collection("personnel").create<Record<string, unknown>>({
      personnel_id: body.personnelId.trim(),
      full_name: body.fullName.trim(),
      rank: body.rank.trim(),
      position: body.position.trim(),
      department: body.department.trim(),
      phone: body.phone.trim(),
      national_id: body.nationalId?.trim() ?? "",
      status: body.status,
    });

    return NextResponse.json({ item: toDomainPersonnel(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error("POST /api/personnel failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("POST /api/personnel failed", error);
    return NextResponse.json({ message: "Unable to create personnel" }, { status: 500 });
  }
}
