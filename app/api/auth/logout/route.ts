import { ROLE_COOKIE } from "@/lib/access-control";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("pb_auth", "", { maxAge: 0, path: "/" });
  response.cookies.set(ROLE_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
