import { ROLE_COOKIE } from "@/lib/access-control";
import { authWithPassword, setPocketBaseAuthCookie } from "@/lib/pocketbase";
import { NextResponse } from "next/server";

interface LoginPayload {
  email: string;
  password: string;
}
const SESSION_MAX_AGE = 60 * 60 * 8;

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as LoginPayload;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const authData = await authWithPassword(email, password);
    const roleValue = authData.model.role as string | undefined;
    if (roleValue !== "ADMIN" && roleValue !== "OFFICER") {
      return NextResponse.json({ message: "Invalid user role configuration" }, { status: 403 });
    }

    const response = NextResponse.json({ success: true });
    setPocketBaseAuthCookie(response, authData.token, authData.model, SESSION_MAX_AGE);
    response.cookies.set({
      name: ROLE_COOKIE,
      value: roleValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Authentication failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
  }
}
