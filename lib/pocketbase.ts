import PocketBase from "pocketbase";

const pocketBaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

export function createPocketBaseClient() {
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
