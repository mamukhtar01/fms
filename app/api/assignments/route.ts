import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainAssignment } from "@/lib/mappers/assignment";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

interface AssignmentCreatePayload {
  firearmId: string;
  officerId: string;
  expectedReturnDate: string;
  issueCondition: string;
  purpose: string;
  remarks?: string;
  ammunitionType?: string;
  quantityIssued?: number;
}

export async function GET(request: Request) {
  try {
    const pb = createPocketBaseServerClient(request.headers.get("cookie"));

    if (!pb.authStore.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch assignments with expanded relation fields
    const records = await pb.collection("firearm_assignments").getFullList<Record<string, unknown>>({
      expand: "firearm_id,officer_id,assigned_by",
      sort: "-id",
    });

    // Fetch all ammunition transactions to join with assignments
    let ammoMap = new Map<string, Record<string, unknown>>();
    try {
      const ammoRecords = await pb.collection("ammunition_transactions").getFullList<Record<string, unknown>>();
      for (const ammo of ammoRecords) {
        const assignmentId = String(ammo.assignment_id ?? "");
        if (assignmentId) {
          ammoMap.set(assignmentId, ammo);
        }
      }
    } catch (ammoError) {
      console.warn("Could not load ammunition transactions for assignments", ammoError);
    }

    return NextResponse.json({
      items: records.map((record) => toDomainAssignment(record, ammoMap)),
    });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error("GET /api/assignments failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("GET /api/assignments failed", error);
    return NextResponse.json({ message: "Unable to load assignments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssignmentCreatePayload;

    const requiredFields: Array<keyof AssignmentCreatePayload> = [
      "firearmId",
      "officerId",
      "expectedReturnDate",
      "issueCondition",
      "purpose",
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

    // 1. Verify Firearm is Available
    let firearmRecord: Record<string, unknown>;
    try {
      firearmRecord = await pb.collection("firearms").getOne<Record<string, unknown>>(body.firearmId);
      if (String(firearmRecord.status) !== "Available") {
        return NextResponse.json(
          { message: "Selected firearm is not Available (currently status is " + firearmRecord.status + ")" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ message: "Selected firearm was not found" }, { status: 400 });
    }

    // 2. Verify Officer is Active
    try {
      const officerRecord = await pb.collection("personnel").getOne<Record<string, unknown>>(body.officerId);
      if (String(officerRecord.status) !== "Active") {
        return NextResponse.json(
          { message: "Selected officer is Inactive" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json({ message: "Selected officer was not found" }, { status: 400 });
    }

    // 3. Create the Firearm Assignment
    const assignmentNumber = `ASN-${Date.now().toString().slice(-6)}`;
    const createdAssignment = await pb.collection("firearm_assignments").create<Record<string, unknown>>({
      assignment_number: assignmentNumber,
      firearm_id: body.firearmId,
      officer_id: body.officerId,
      assigned_by: userId,
      assignment_datetime: dayjs().toISOString(),
      expected_return_date: dayjs(body.expectedReturnDate).format("YYYY-MM-DD"),
      issue_condition: body.issueCondition,
      purpose: body.purpose.trim(),
      remarks: body.remarks?.trim() ?? "",
      status: "Active",
    });

    // 4. Optionally create Ammunition Transaction
    if (body.ammunitionType?.trim() && body.quantityIssued && body.quantityIssued > 0) {
      try {
        await pb.collection("ammunition_transactions").create({
          assignment_id: String(createdAssignment.id),
          ammunition_type: body.ammunitionType.trim(),
          quantity_issued: body.quantityIssued,
          quantity_returned: 0,
          quantity_expended: 0,
          quantity_missing: 0,
        });
      } catch (ammoError) {
        console.error("Failed to create ammunition transaction", ammoError);
        // We do not roll back assignment as weapon was still issued, but log error
      }
    }

    // 5. Update Firearm status to Assigned and set holder to officer id
    try {
      await pb.collection("firearms").update(body.firearmId, {
        status: "Assigned",
        current_holder: body.officerId,
      });
    } catch (firearmError) {
      console.error("Failed to update firearm status", firearmError);
    }

    // Refresh and map assignment
    const finalAssignment = await pb.collection("firearm_assignments").getOne<Record<string, unknown>>(
      String(createdAssignment.id),
      { expand: "firearm_id,officer_id,assigned_by" }
    );

    let ammoMap = new Map<string, Record<string, unknown>>();
    if (body.ammunitionType?.trim() && body.quantityIssued && body.quantityIssued > 0) {
      try {
        const ammoRecord = await pb.collection("ammunition_transactions").getFirstListItem<Record<string, unknown>>(
          `assignment_id = "${String(createdAssignment.id)}"`
        );
        ammoMap.set(String(createdAssignment.id), ammoRecord);
      } catch {}
    }

    return NextResponse.json(
      { item: toDomainAssignment(finalAssignment, ammoMap) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ClientResponseError) {
      console.error("POST /api/assignments failed", error.status, error.response?.data);
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    console.error("POST /api/assignments failed", error);
    return NextResponse.json({ message: "Unable to create assignment" }, { status: 500 });
  }
}
