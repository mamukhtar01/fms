import { pb } from "@/lib/pb";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainAssignment } from "@/lib/mappers/assignment";
import type { FirearmAssignment } from "@/types/domain";
import { ClientResponseError } from "pocketbase";
import dayjs from "dayjs";

export async function getAssignments(): Promise<FirearmAssignment[]> {
  try {
    const records = await pb
      .collection("firearm_assignments")
      .getFullList<Record<string, unknown>>({
        expand: "firearm_id,officer_id,assigned_by",
        sort: "-id",
      });

    const ammoMap = new Map<string, Record<string, unknown>>();
    try {
      const ammoRecords = await pb
        .collection("ammunition_transactions")
        .getFullList<Record<string, unknown>>();
      for (const ammo of ammoRecords) {
        const assignmentId = String(ammo.assignment_id ?? "");
        if (assignmentId) ammoMap.set(assignmentId, ammo);
      }
    } catch {
      // ammunition is optional
    }

    return records.map((r) => toDomainAssignment(r, ammoMap));
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export interface AssignmentCreatePayload {
  firearmId: string;
  officerId: string;
  expectedReturnDate: string;
  issueCondition: string;
  purpose: string;
  remarks?: string;
  ammunitionType?: string;
  quantityIssued?: number;
}

export async function createAssignment(
  payload: AssignmentCreatePayload,
): Promise<FirearmAssignment> {
  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error("Unauthorized");

  try {
    // 1. Verify firearm availability
    const firearmRecord = await pb
      .collection("firearms")
      .getOne<Record<string, unknown>>(payload.firearmId)
      .catch(() => {
        throw new Error("Selected firearm was not found");
      });
    if (String(firearmRecord.status) !== "Available") {
      throw new Error(
        `Selected firearm is not Available (currently status is ${firearmRecord.status})`,
      );
    }

    // 2. Verify officer is active
    const officerRecord = await pb
      .collection("personnel")
      .getOne<Record<string, unknown>>(payload.officerId)
      .catch(() => {
        throw new Error("Selected officer was not found");
      });
    if (String(officerRecord.status) !== "Active") {
      throw new Error("Selected officer is Inactive");
    }

    console.log("Firearm and officer verified, proceeding with assignment creation");

    // 3. Create assignment
    const assignmentNumber = `ASN-${Date.now().toString().slice(-6)}`;
    const createdAssignment = await pb
      .collection("firearm_assignments")
      .create<Record<string, unknown>>({
        assignment_number: assignmentNumber,
        firearm_id: payload.firearmId,
        officer_id: payload.officerId,
        assigned_by: userId,
        assignment_datetime: dayjs().toISOString(),
        expected_return_date: dayjs(payload.expectedReturnDate).format("YYYY-MM-DD"),
        issue_condition: payload.issueCondition,
        purpose: payload.purpose.trim(),
        remarks: payload.remarks?.trim() ?? "",
        status: "Active",
      });

    // 4. Optional ammunition transaction
    if (payload.ammunitionType?.trim() && payload.quantityIssued && payload.quantityIssued > 0) {
      try {
        await pb.collection("ammunition_transactions").create({
          assignment_id: String(createdAssignment.id),
          ammunition_type: payload.ammunitionType.trim(),
          quantity_issued: payload.quantityIssued,
          quantity_returned: 0,
          quantity_expended: 0,
          quantity_missing: 0,
        });
      } catch {
        // non-critical — log but don't fail
        console.error("Failed to create ammunition transaction");
      }
    }

    // 5. Update firearm status
    try {
      await pb.collection("firearms").update(payload.firearmId, {
        status: "Assigned",
        current_holder: payload.officerId,
      });
    } catch {
      console.error("Failed to update firearm status");
    }

    // 6. Fetch final assignment with relations
    const finalAssignment = await pb
      .collection("firearm_assignments")
      .getOne<Record<string, unknown>>(String(createdAssignment.id), {
        expand: "firearm_id,officer_id,assigned_by",
      });

    const ammoMap = new Map<string, Record<string, unknown>>();
    if (payload.ammunitionType?.trim() && payload.quantityIssued && payload.quantityIssued > 0) {
      try {
        const ammoRecord = await pb
          .collection("ammunition_transactions")
          .getFirstListItem<Record<string, unknown>>(
            `assignment_id = "${String(createdAssignment.id)}"`,
          );
        ammoMap.set(String(createdAssignment.id), ammoRecord);
      } catch {}
    }

    return toDomainAssignment(finalAssignment, ammoMap);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}

export interface ReturnPayload {
  returnCondition: string;
  quantityReturned?: number;
  quantityExpended?: number;
  quantityMissing?: number;
  remarks?: string;
}

export async function returnAssignment(
  id: string,
  payload: ReturnPayload,
): Promise<FirearmAssignment> {
  try {
    // 1. Fetch current assignment
    const assignment = await pb
      .collection("firearm_assignments")
      .getOne<Record<string, unknown>>(id)
      .catch(() => {
        throw new Error("Assignment record not found");
      });
    if (String(assignment.status) === "Returned") {
      throw new Error("This firearm has already been returned");
    }

    const firearmId = String(assignment.firearm_id ?? "");

    // 2. Update ammunition transaction
    let updatedAmmo: Record<string, unknown> | undefined;
    try {
      const ammoRecords = await pb
        .collection("ammunition_transactions")
        .getFullList<Record<string, unknown>>({ filter: `assignment_id = "${id}"` });
      if (ammoRecords.length > 0) {
        updatedAmmo = await pb
          .collection("ammunition_transactions")
          .update<Record<string, unknown>>(String(ammoRecords[0].id), {
            quantity_returned: payload.quantityReturned ?? 0,
            quantity_expended: payload.quantityExpended ?? 0,
            quantity_missing: payload.quantityMissing ?? 0,
          });
      }
    } catch {}

    // 3. Update firearm status
    if (firearmId) {
      try {
        const nextStatus =
          payload.returnCondition === "Damaged" ? "Under Maintenance" : "Available";
        await pb.collection("firearms").update(firearmId, {
          status: nextStatus,
          condition: payload.returnCondition,
          current_holder: "",
        });
      } catch {
        console.error("Failed to update firearm status on return");
      }
    }

    // 4. Update assignment record
    const updatedAssignment = await pb
      .collection("firearm_assignments")
      .update<Record<string, unknown>>(id, {
        status: "Returned",
        actual_return_datetime: dayjs().toISOString(),
        return_condition: payload.returnCondition,
        remarks: payload.remarks?.trim()
          ? `${String(assignment.remarks || "")}\n\n[Return Notes]: ${payload.remarks.trim()}`
          : String(assignment.remarks || ""),
      });

    const finalAssignment = await pb
      .collection("firearm_assignments")
      .getOne<Record<string, unknown>>(String(updatedAssignment.id), {
        expand: "firearm_id,officer_id,assigned_by",
      });

    const ammoMap = new Map<string, Record<string, unknown>>();
    if (updatedAmmo) {
      ammoMap.set(String(finalAssignment.id), updatedAmmo);
    }

    return toDomainAssignment(finalAssignment, ammoMap);
  } catch (error) {
    if (error instanceof ClientResponseError) {
      throw new Error(pocketBaseErrorMessage(error));
    }
    throw error;
  }
}
