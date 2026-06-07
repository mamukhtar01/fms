import { pb } from "@/lib/pb";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainPersonnel } from "@/lib/mappers/personnel";
import type { Personnel, PersonnelStatus } from "@/types/domain";
import { ClientResponseError } from "pocketbase";

export async function getPersonnelList(): Promise<Personnel[]> {
  try {
    const records = await pb.collection("personnel").getFullList<Record<string, unknown>>({
      sort: "-id",
    });
    return records.map(toDomainPersonnel);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export async function getPersonnel(id: string): Promise<Personnel> {
  try {
    const record = await pb.collection("personnel").getOne<Record<string, unknown>>(id);
    return toDomainPersonnel(record);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 404) throw new Error("Personnel record not found");
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export interface PersonnelPayload {
  personnelId: string;
  fullName: string;
  rank: string;
  position: string;
  department: string;
  phone: string;
  nationalId?: string;
  status: PersonnelStatus;
}

export async function createPersonnel(payload: PersonnelPayload): Promise<Personnel> {
  try {
    const created = await pb.collection("personnel").create<Record<string, unknown>>({
      personnel_id: payload.personnelId.trim(),
      full_name: payload.fullName.trim(),
      rank: payload.rank.trim(),
      position: payload.position.trim(),
      department: payload.department.trim(),
      phone: payload.phone.trim(),
      national_id: payload.nationalId?.trim() ?? "",
      status: payload.status,
    });
    return toDomainPersonnel(created);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export async function updatePersonnel(id: string, payload: PersonnelPayload): Promise<Personnel> {
  try {
    const updated = await pb.collection("personnel").update<Record<string, unknown>>(id, {
      personnel_id: payload.personnelId.trim(),
      full_name: payload.fullName.trim(),
      rank: payload.rank.trim(),
      position: payload.position.trim(),
      department: payload.department.trim(),
      phone: payload.phone.trim(),
      national_id: payload.nationalId?.trim() ?? "",
      status: payload.status,
    });
    return toDomainPersonnel(updated);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      if (error.status === 404) throw new Error("Personnel record not found");
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}
