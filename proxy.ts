import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const PUBLIC_PATHS = ["/login"];
const DEFAULT_POCKETBASE_URL = "http://127.0.0.1:8090";

function isAuthenticated(request: NextRequest) {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_POCKETBASE_URL ?? DEFAULT_POCKETBASE_URL,
  );

  pb.authStore.loadFromCookie(
    request.headers.get("cookie") || ""
  );

  return pb.authStore.isValid;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname);

  const authenticated = isAuthenticated(request);

  // Not logged in
  if (!authenticated && !isPublic) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Already logged in
  if (authenticated && pathname === "/login") {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};