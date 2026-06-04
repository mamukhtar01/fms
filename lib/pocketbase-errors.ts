import { ClientResponseError } from "pocketbase";

export function pocketBaseErrorMessage(error: ClientResponseError) {
  const data = error.response?.data as { message?: string; data?: Record<string, { message?: string }> } | undefined;
  const fieldMessages = data?.data
    ? Object.entries(data.data)
        .map(([field, detail]) => `${field}: ${detail.message ?? "invalid"}`)
        .join("; ")
    : "";

  if (fieldMessages) return fieldMessages;

  const message = data?.message || error.message || "Request failed";

  if (error.status === 403) {
    return `${message}. Check PocketBase API rules for the personnel collection (list/view should allow authenticated users, e.g. @request.auth.id != "").`;
  }

  if (error.status === 404 && message.toLowerCase().includes("collection")) {
    return `${message}. Create or import the "personnel" collection in PocketBase (see pocketbase/schema.json).`;
  }

  return message;
}
