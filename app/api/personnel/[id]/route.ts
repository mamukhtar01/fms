import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainPersonnel } from "@/lib/mappers/personnel";
import type { PersonnelStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

interface PersonnelUpdatePayload {
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  nationalId?: string;
  status: PersonnelStatus;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const record = await pb.collection("personnel").getOne<Record<string, unknown>>(id);

    return NextResponse.json({ item: toDomainPersonnel(record) });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ message: "Personnel record not found" }, { status: 404 });
    }
    if (error instanceof ClientResponseError) {
      console.error("GET /api/personnel/[id] failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("GET /api/personnel/[id] failed", error);
    return NextResponse.json({ message: "Unable to load personnel" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as PersonnelUpdatePayload;

    const requiredFields: Array<keyof PersonnelUpdatePayload> = [
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

    const updated = await pb.collection("personnel").update<Record<string, unknown>>(id, {
      personnel_id: body.personnelId.trim(),
      full_name: body.fullName.trim(),
      rank: body.rank.trim(),
      position: body.position.trim(),
      department: body.department.trim(),
      phone: body.phone.trim(),
      national_id: body.nationalId?.trim() ?? "",
      status: body.status,
    });

    return NextResponse.json({ item: toDomainPersonnel(updated) });
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) {
      return NextResponse.json({ message: "Personnel record not found" }, { status: 404 });
    }
    if (error instanceof ClientResponseError) {
      console.error("PUT /api/personnel/[id] failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("PUT /api/personnel/[id] failed", error);
    return NextResponse.json({ message: "Unable to update personnel" }, { status: 500 });
  }
}
