import type { Personnel, PersonnelStatus } from "@/types/domain";

export function toDomainPersonnel(record: Record<string, unknown>): Personnel {
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
