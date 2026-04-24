export function sanitizeFilename(name: string): string {
  const sanitized = name
    .replace(/&/g, "and")
    .replace(/[()]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "wedding";
}
