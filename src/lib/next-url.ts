/** Solo se aceptan rutas internas ("/reservar"), nunca direcciones externas. */
export function safeNext(value: unknown, fallback: string): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("\\") ? v : fallback;
}
