import { createPocketBaseServerClient } from "@/lib/pocketbase";
import type { Firearm, FirearmCondition, FirearmStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

interface FirearmCreatePayload {
  weaponType: string;
  weaponName: string;
  model: string;
  serialNumber: string;
  ownershipType: "Company-Owned" | "Personally-Owned";
  ownerName: string;
  currentLocation: string;
  status: FirearmStatus;
  condition: FirearmCondition;
  dateAcquired?: string;
}

function toDomainFirearm(record: Record<string, unknown>): Firearm {
  return {
    id: String(record.id ?? ""),
    firearmId: String(record.firearm_id ?? ""),
    weaponType: String(record.weapon_type ?? ""),
    weaponName: String(record.weapon_name ?? ""),
    model: String(record.model ?? ""),
    serialNumber: String(record.serial_number ?? ""),
    ownershipType: String(record.ownership_type ?? "Company-Owned") as Firearm["ownershipType"],
    ownerName: String(record.owner_name ?? ""),
    condition: String(record.condition ?? "Good") as FirearmCondition,
    status: String(record.status ?? "Available") as FirearmStatus,
    currentLocation: String(record.current_location ?? ""),
    currentHolder: String(record.current_holder ?? "Armoury"),
    createdBy: String(record.created_by ?? ""),
  };
}

function buildFirearmCode(serialNumber: string) {
  const normalized = serialNumber.replace(/\s+/g, "").toUpperCase();
  const serialPart = normalized.slice(-4).padStart(4, "0");
  const timestampPart = Date.now().toString().slice(-5);
  return `FR-${serialPart}-${timestampPart}`;
}

function pocketBaseErrorMessage(error: ClientResponseError) {
  const data = error.response?.data as { message?: string; data?: Record<string, { message?: string }> } | undefined;
  const fieldMessages = data?.data
    ? Object.entries(data.data)
        .map(([field, detail]) => `${field}: ${detail.message ?? "invalid"}`)
        .join("; ")
    : "";
  return fieldMessages || data?.message || error.message || "Request failed";
}

export async function GET(request: Request) {
  try {
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    const records = await pb.collection("firearms").getFullList<Record<string, unknown>>({
      sort: "-created",
    });

    return NextResponse.json({ items: records.map(toDomainFirearm) });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ message: "Unable to load firearms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FirearmCreatePayload;

    const requiredFields: Array<keyof FirearmCreatePayload> = [
      "weaponType",
      "weaponName",
      "model",
      "serialNumber",
      "ownershipType",
      "ownerName",
      "currentLocation",
      "status",
      "condition",
    ];

    const missingField = requiredFields.find((field) => !body[field]);
    if (missingField) {
      return NextResponse.json({ message: `${missingField} is required` }, { status: 400 });
    }

    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    const userId = pb.authStore.record?.id;
    if (!pb.authStore.isValid || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const created = await pb.collection("firearms").create<Record<string, unknown>>({
      firearm_id: buildFirearmCode(body.serialNumber),
      weapon_type: body.weaponType,
      weapon_name: body.weaponName,
      model: body.model,
      serial_number: body.serialNumber,
      ownership_type: body.ownershipType,
      owner_name: body.ownerName,
      status: body.status,
      condition: body.condition,
      current_location: body.currentLocation,
      date_acquired: body.dateAcquired,
      created_by: userId,
    });

    return NextResponse.json({ item: toDomainFirearm(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ message: "Unable to create firearm" }, { status: 500 });
  }
}
