import { ClientResponseError } from "pocketbase";

export function pocketBaseErrorMessage(error: ClientResponseError) {
  const data = error.response?.data as { message?: string; data?: Record<string, { message?: string }> } | undefined;
  const fieldMessages = data?.data
    ? Object.entries(data.data)
        .map(([field, detail]) => `${field}: ${detail.message ?? "invalid"}`)
        .join("; ")
    : "";
  return fieldMessages || data?.message || error.message || "Request failed";
}
