import { NextRequest, NextResponse } from "next/server";
import { createPocketBaseClient } from "./lib/pocketbase";

const PUBLIC_PATHS = ["/login"];

function isAuthenticated(request: NextRequest) {
  const pb = createPocketBaseClient();

  pb.authStore.loadFromCookie(
    request.headers.get("cookie") || ""
  );

  console.log("token", pb.authStore.token); 
  console.log("model", pb.authStore.model);
  console.log("record", pb.authStore.record);
  console.log("exportToCookie", pb.authStore.exportToCookie());

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