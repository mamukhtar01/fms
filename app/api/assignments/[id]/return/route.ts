import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainAssignment } from "@/lib/mappers/assignment";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

type RouteContext = { params: Promise<{ id: string }> };

interface ReturnPayload {
  returnCondition: string;
  quantityReturned?: number;
  quantityExpended?: number;
  quantityMissing?: number;
  remarks?: string;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as ReturnPayload;

    if (!body.returnCondition) {
      return NextResponse.json({ message: "returnCondition is required" }, { status: 400 });
    }

    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch current assignment details
    let assignment: Record<string, unknown>;
    try {
      assignment = await pb.collection("firearm_assignments").getOne<Record<string, unknown>>(id);
      if (String(assignment.status) === "Returned") {
        return NextResponse.json({ message: "This firearm has already been returned" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ message: "Assignment record not found" }, { status: 404 });
    }

    const firearmId = String(assignment.firearm_id ?? "");

    // 2. Process ammunition transaction update if any
    let updatedAmmo: Record<string, unknown> | undefined;
    try {
      // Find the ammunition transaction for this assignment
      const ammoRecords = await pb.collection("ammunition_transactions").getFullList<Record<string, unknown>>({
        filter: `assignment_id = "${id}"`,
      });

      if (ammoRecords.length > 0) {
        const ammoRecord = ammoRecords[0];
        updatedAmmo = await pb.collection("ammunition_transactions").update<Record<string, unknown>>(String(ammoRecord.id), {
          quantity_returned: body.quantityReturned ?? 0,
          quantity_expended: body.quantityExpended ?? 0,
          quantity_missing: body.quantityMissing ?? 0,
        });
      }
    } catch (ammoError) {
      console.warn("Could not update ammunition transaction", ammoError);
    }

    // 3. Update firearm status and condition
    if (firearmId) {
      try {
        // If returned condition is "Damaged", set firearm status to "Under Maintenance"
        // Otherwise set status to "Available"
        const nextStatus = body.returnCondition === "Damaged" ? "Under Maintenance" : "Available";
        await pb.collection("firearms").update(firearmId, {
          status: nextStatus,
          condition: body.returnCondition,
          current_holder: "", // clear current holder
        });
      } catch (firearmError) {
        console.error("Failed to update firearm status on return", firearmError);
      }
    }

    // 4. Update the assignment record itself
    const updatedAssignment = await pb.collection("firearm_assignments").update<Record<string, unknown>>(id, {
      status: "Returned",
      actual_return_datetime: dayjs().toISOString(),
      return_condition: body.returnCondition,
      remarks: body.remarks?.trim()
        ? `${String(assignment.remarks || "")}\n\n[Return Notes]: ${body.remarks.trim()}`
        : String(assignment.remarks || ""),
    });

    // Fetch final assignment with expanded relations
    const finalAssignment = await pb.collection("firearm_assignments").getOne<Record<string, unknown>>(
      String(updatedAssignment.id),
      { expand: "firearm_id,officer_id,assigned_by" }
    );

    let ammoMap = new Map<string, Record<string, unknown>>();
    if (updatedAmmo) {
      ammoMap.set(String(finalAssignment.id), updatedAmmo);
    }

    return NextResponse.json({ item: toDomainAssignment(finalAssignment, ammoMap) });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error(`POST /api/assignments/[id]/return failed`, error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error(`POST /api/assignments/[id]/return failed`, error);
    return NextResponse.json({ message: "Unable to process return" }, { status: 500 });
  }
}
