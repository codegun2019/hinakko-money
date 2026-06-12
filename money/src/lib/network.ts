export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("load failed") ||
    msg.includes("net::err_internet_disconnected") ||
    msg.includes("offline")
  );
}
