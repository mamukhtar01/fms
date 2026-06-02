import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPath = "/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const isPublicPath = normalizedPath === publicPath;
  const hasPocketBaseSession = Boolean(request.cookies.get("pb_auth")?.value);
  const hasRoleSession = Boolean(request.cookies.get("safms_role")?.value);
  const hasSession = hasPocketBaseSession || hasRoleSession;

  if (!hasSession && !isPublicPath && !pathname.startsWith("/api/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
