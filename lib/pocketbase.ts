import PocketBase from "pocketbase";

const DEFAULT_POCKETBASE_URL = "http://127.0.0.1:8090";
const pocketBaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? DEFAULT_POCKETBASE_URL;

export function createPocketBaseClient() {
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    throw new Error("NEXT_PUBLIC_POCKETBASE_URL is required in production.");
  }
  if (process.env.NODE_ENV === "production" && pocketBaseUrl.startsWith("http://")) {
    throw new Error("NEXT_PUBLIC_POCKETBASE_URL must use HTTPS in production.");
  }
  return new PocketBase(pocketBaseUrl);
}

export async function authWithPassword(email: string, password: string) {
  const pb = createPocketBaseClient();
  const authData = await pb.collection("users").authWithPassword(email, password);
  return {
    token: authData.token,
    model: authData.record,
    cookie: pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
    }),
  };
}
