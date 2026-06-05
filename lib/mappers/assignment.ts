import type { FirearmAssignment, AssignmentCondition, AssignmentStatus } from "@/types/domain";

export function toDomainAssignment(
  record: Record<string, unknown>,
  ammoMap?: Map<string, Record<string, unknown>>
): FirearmAssignment {
  const expand = record.expand as Record<string, unknown> | undefined;
  const firearm = expand?.firearm_id as Record<string, unknown> | undefined;
  const officer = expand?.officer_id as Record<string, unknown> | undefined;
  const assignedBy = expand?.assigned_by as Record<string, unknown> | undefined;

  const ammo = ammoMap?.get(record.id);

  return {
    id: String(record.id ?? ""),
    assignmentNumber: record.assignment_number ? String(record.assignment_number) : undefined,
    firearmId: String(record.firearm_id ?? ""),
    firearmCode: firearm ? String(firearm.firearm_id ?? "") : "",
    firearmModel: firearm ? String(firearm.model ?? "") : "",
    firearmSerial: firearm ? String(firearm.serial_number ?? "") : "",
    officerId: String(record.officer_id ?? ""),
    officerCode: officer ? String(officer.personnel_id ?? "") : "",
    officerName: officer ? String(officer.full_name ?? "") : "",
    assignedById: String(record.assigned_by ?? ""),
    assignedByName: assignedBy ? String(assignedBy.name ?? "") : "",
    assignmentDatetime: String(record.assignment_datetime ?? ""),
    expectedReturnDate: String(record.expected_return_date ?? ""),
    actualReturnDatetime: record.actual_return_datetime ? String(record.actual_return_datetime) : undefined,
    issueCondition: String(record.issue_condition ?? "Good") as AssignmentCondition,
    returnCondition: record.return_condition ? (String(record.return_condition) as AssignmentCondition) : undefined,
    remarks: String(record.remarks ?? ""),
    purpose: String(record.purpose ?? ""),
    status: String(record.status ?? "Active") as AssignmentStatus,
    notes: String(record.notes ?? ""),

    // Ammo details
    ammunitionType: ammo ? String(ammo.ammunition_type ?? "") : undefined,
    quantityIssued: ammo ? Number(ammo.quantity_issued ?? 0) : undefined,
    quantityReturned: ammo ? Number(ammo.quantity_returned ?? 0) : undefined,
    quantityExpended: ammo ? Number(ammo.quantity_expended ?? 0) : undefined,
    quantityMissing: ammo ? Number(ammo.quantity_missing ?? 0) : undefined,
  };
}
