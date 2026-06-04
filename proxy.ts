import { isPocketBaseAuthenticated } from "@/lib/pocketbase";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login"];

function isAuthenticated(request: NextRequest) {
  return isPocketBaseAuthenticated(request.headers.get("cookie"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const authenticated = isAuthenticated(request);

  if (!authenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
