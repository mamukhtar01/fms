import { createPocketBaseServerClient } from "@/lib/pocketbase";
import { pocketBaseErrorMessage } from "@/lib/pocketbase-errors";
import { toDomainPersonnel } from "@/lib/mappers/personnel";
import { ClientResponseError } from "pocketbase";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

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
      return NextResponse.json(
        { message: pocketBaseErrorMessage(error) },
        { status: error.status || 500 },
      );
    }

    return NextResponse.json({ message: "Unable to load personnel" }, { status: 500 });
  }
}
