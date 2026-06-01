import { authWithPassword } from "@/lib/pocketbase";
import { ROLE_COOKIE } from "@/lib/access-control";
import { NextResponse } from "next/server";

interface LoginPayload {
  email: string;
  password: string;
  role?: "ADMIN" | "OFFICER";
}

export async function POST(request: Request) {
  try {
    const { email, password, role } = (await request.json()) as LoginPayload;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const authData = await authWithPassword(email, password);
    const userRole = role ?? (authData.model.role as "ADMIN" | "OFFICER" | undefined) ?? "OFFICER";

    const response = NextResponse.json({ success: true });
    response.headers.append("set-cookie", authData.cookie);
    response.cookies.set({
      name: ROLE_COOKIE,
      value: userRole,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ message: "Invalid login credentials" }, { status: 401 });
  }
}
