import { pb } from "@/lib/pb";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import type { Firearm, FirearmCondition, FirearmOwnershipType, FirearmStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import dayjs from "dayjs";

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

function expandedRelation(record: Record<string, unknown>, key: string): unknown {
  const expand = record.expand as Record<string, unknown> | undefined;
  if (expand?.[key]) return expand[key];
  return record[key];
}

function buildFirearmCode(serialNumber: string): string {
  const normalized = serialNumber.replace(/\s+/g, "").toUpperCase();
  const serialPart = normalized.slice(-4).padStart(4, "0");
  const timestampPart = Date.now().toString().slice(-5);
  return `FR-${serialPart}-${timestampPart}`;
}

function toDomainFirearm(
  record: Record<string, unknown>,
  personnelNames: Map<string, string> = new Map(),
): Firearm {
  const owner = expandedRelation(record, "owner");
  const currentHolder = expandedRelation(record, "current_holder");
  const createdBy = expandedRelation(record, "created_by");
  const ownerId = relationId(owner);
  const currentHolderId = relationId(currentHolder);

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
    ownerId,
    ownerName: relationDisplayName(owner) || personnelNames.get(ownerId) || "",
    status: String(record.status ?? "Available") as FirearmStatus,
    condition: String(record.condition ?? "Good") as FirearmCondition,
    currentHolderId,
    currentHolderName:
      relationDisplayName(currentHolder) || personnelNames.get(currentHolderId) || "",
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

async function loadPersonnelNames(ids: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const names = new Map<string, string>();
  if (!uniqueIds.length) return names;

  try {
    const filter = uniqueIds.map((id) => `id="${id}"`).join(" || ");
    const rows = await pb.collection("personnel").getFullList<Record<string, unknown>>({
      filter,
      sort: "-id",
    });
    for (const row of rows) {
      names.set(String(row.id), String(row.full_name ?? ""));
    }
  } catch {
    // non-critical — names remain empty
  }

  return names;
}

export async function getFirearms(): Promise<Firearm[]> {
  try {
    const records = await pb.collection("firearms").getFullList<Record<string, unknown>>({
      sort: "-id",
    });

    const personnelIds = records.flatMap((r) => [
      relationId(r.owner),
      relationId(r.current_holder),
    ]);
    const personnelNames = await loadPersonnelNames(personnelIds);

    return records.map((r) => toDomainFirearm(r, personnelNames));
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export interface FirearmCreatePayload {
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

export async function createFirearm(payload: FirearmCreatePayload): Promise<Firearm> {
  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error("Unauthorized");

  try {
    if (payload.ownershipType === "person" && payload.ownerId) {
      try {
        await pb.collection("personnel").getOne(payload.ownerId);
      } catch {
        throw new Error("Selected owner was not found in personnel");
      }
    }

    const created = await pb.collection("firearms").create<Record<string, unknown>>({
      firearm_id: buildFirearmCode(payload.serialNumber),
      weapon_type: payload.weaponType,
      model: payload.model,
      serial_number: payload.serialNumber,
      manufacturer: payload.manufacturer ?? "",
      caliber: payload.caliber ?? "",
      registration_number: payload.registrationNumber ?? "",
      asset_tag: payload.assetTag ?? "",
      ownership_type: payload.ownershipType,
      ...(payload.ownershipType === "person" && payload.ownerId
        ? { owner: payload.ownerId }
        : {}),
      status: payload.status,
      condition: payload.condition,
      date_acquired: payload.dateAcquired ?? dayjs().format("YYYY-MM-DD"),
      created_by: userId,
      notes: payload.notes ?? "",
      remarks: payload.remarks ?? "",
    });

    return toDomainFirearm(created);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}
