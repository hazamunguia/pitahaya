export const TZ = "America/Mexico_City";
export const money = (n: number) => `$${Number(n).toLocaleString("es-MX")}`;
export function fechaLarga(f: string) {
  return new Date(`${f}T12:00:00-06:00`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}
export function hora12(h: string) {
  const [H, M] = h.split(":").map(Number);
  return `${H % 12 || 12}:${String(M).padStart(2, "0")} ${H < 12 ? "a.m." : "p.m."}`;
}
export function duracion(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
export function fechaHoraLarga(iso: string) {
  return new Date(iso).toLocaleString("es-MX", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
}
export function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
}
export function horaDeIso(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
}
/** YYYY-MM-DD en hora de México. */
export function diaDeIso(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}
export const ESTADOS: Record<string, string> = { pending: "Por confirmar", confirmed: "Confirmada", done: "Realizada", cancelled: "Cancelada", quote: "Por cotizar" };
