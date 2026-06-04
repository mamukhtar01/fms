import PocketBase, { BaseAuthStore, getTokenPayload, type RecordModel } from "pocketbase";
import type { NextResponse } from "next/server";

const DEFAULT_POCKETBASE_URL = "http://127.0.0.1:8090";
const pocketBaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? DEFAULT_POCKETBASE_URL;

export const PB_AUTH_COOKIE = "pb_auth";

function assertPocketBaseUrl() {
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    throw new Error("NEXT_PUBLIC_POCKETBASE_URL is required in production.");
  }
  if (process.env.NODE_ENV === "production" && pocketBaseUrl.startsWith("http://")) {
    throw new Error("NEXT_PUBLIC_POCKETBASE_URL must use HTTPS in production.");
  }
}

/** Browser/client PocketBase instance (reads pb_auth from document.cookie). */
export function createPocketBaseClient() {
  assertPocketBaseUrl();
  const pb = new PocketBase(pocketBaseUrl);
  if (typeof document !== "undefined") {
    pb.authStore.loadFromCookie(document.cookie, PB_AUTH_COOKIE);
  }
  return pb;
}

/**
 * Server/proxy PocketBase instance using BaseAuthStore (not LocalAuthStore).
 * LocalAuthStore reads localStorage and does not work in proxy or route handlers.
 */
export function createPocketBaseServerClient(cookieHeader?: string | null) {
  assertPocketBaseUrl();
  const pb = new PocketBase(pocketBaseUrl, new BaseAuthStore());
  pb.authStore.loadFromCookie(cookieHeader ?? "", PB_AUTH_COOKIE);
  return pb;
}

export function isPocketBaseAuthenticated(cookieHeader?: string | null) {
  const pb = createPocketBaseServerClient(cookieHeader);
  return pb.authStore.isValid;
}

export function setPocketBaseAuthCookie(
  response: NextResponse,
  token: string,
  record: RecordModel,
  maxAgeSeconds?: number,
) {
  const exp = getTokenPayload(token).exp;
  response.cookies.set({
    name: PB_AUTH_COOKIE,
    value: JSON.stringify({ token, record }),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(exp ? { expires: new Date(exp * 1000) } : {}),
    ...(maxAgeSeconds ? { maxAge: maxAgeSeconds } : {}),
  });
}

export async function authWithPassword(email: string, password: string) {
  const pb = createPocketBaseServerClient();
  const authData = await pb.collection("users").authWithPassword(email, password);
  return {
    token: authData.token,
    model: authData.record,
  };
}
