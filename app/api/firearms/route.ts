import { createPocketBaseServerClient } from "@/lib/pocketbase";
import type { Firearm, FirearmCondition, FirearmOwnershipType, FirearmStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

interface FirearmCreatePayload {
  weaponType: string;
  model: string;
  serialNumber: string;
  manufacturer?: string;
  caliber?: string;
  registrationNumber?: string;
  assetTag?: string;
  ownershipType: FirearmOwnershipType;
  ownerId?: string;
  status: FirearmStatus;
  condition: FirearmCondition;
  dateAcquired?: string;
  notes?: string;
  remarks?: string;
}

function relationId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id: string }).id);
  }
  return "";
}

function relationDisplayName(value: unknown, fallback = ""): string {
  if (value && typeof value === "object") {
    const record = value as { full_name?: string; name?: string };
    return String(record.full_name ?? record.name ?? fallback);
  }
  return fallback;
}

function toDomainFirearm(record: Record<string, unknown>): Firearm {
  const owner = record.owner;
  const currentHolder = record.current_holder;
  const createdBy = record.created_by;

  return {
    id: String(record.id ?? ""),
    firearmId: String(record.firearm_id ?? ""),
    weaponType: String(record.weapon_type ?? ""),
    model: String(record.model ?? ""),
    serialNumber: String(record.serial_number ?? ""),
    manufacturer: String(record.manufacturer ?? ""),
    caliber: String(record.caliber ?? ""),
    registrationNumber: String(record.registration_number ?? ""),
    assetTag: String(record.asset_tag ?? ""),
    ownershipType: String(record.ownership_type ?? "sibc") as FirearmOwnershipType,
    ownerId: relationId(owner),
    ownerName: relationDisplayName(owner),
    status: String(record.status ?? "Available") as FirearmStatus,
    condition: String(record.condition ?? "Good") as FirearmCondition,
    currentHolderId: relationId(currentHolder),
    currentHolderName: relationDisplayName(currentHolder),
    dateAcquired: String(record.date_acquired ?? ""),
    image: record.image ? String(record.image) : undefined,
    createdById: relationId(createdBy),
    createdByName: relationDisplayName(createdBy),
    notes: String(record.notes ?? ""),
    remarks: String(record.remarks ?? ""),
    created: record.created ? String(record.created) : undefined,
    updated: record.updated ? String(record.updated) : undefined,
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
      expand: "owner,current_holder,created_by",
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
      "model",
      "serialNumber",
      "ownershipType",
      "status",
      "condition",
    ];

    const missingField = requiredFields.find((field) => !body[field]);
    if (missingField) {
      return NextResponse.json({ message: `${missingField} is required` }, { status: 400 });
    }

    if (body.ownershipType === "person" && !body.ownerId) {
      return NextResponse.json({ message: "ownerId is required for personal ownership" }, { status: 400 });
    }

    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    const userId = pb.authStore.record?.id;
    if (!pb.authStore.isValid || !userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const created = await pb.collection("firearms").create<Record<string, unknown>>({
      firearm_id: buildFirearmCode(body.serialNumber),
      weapon_type: body.weaponType,
      model: body.model,
      serial_number: body.serialNumber,
      manufacturer: body.manufacturer ?? "",
      caliber: body.caliber ?? "",
      registration_number: body.registrationNumber ?? "",
      asset_tag: body.assetTag ?? "",
      ownership_type: body.ownershipType,
      ...(body.ownerId ? { owner: body.ownerId } : {}),
      status: body.status,
      condition: body.condition,
      date_acquired: body.dateAcquired ?? dayjs().format("YYYY-MM-DD"),
      created_by: userId,
      notes: body.notes ?? "",
      remarks: body.remarks ?? "",
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
