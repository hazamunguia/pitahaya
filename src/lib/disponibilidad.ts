import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// México ya no usa horario de verano: el estudio siempre está en UTC-6.
export const TZ = "America/Mexico_City";
const OFFSET = "-06:00";
const MIN_ANTICIPACION_MIN = 120; // no se puede agendar con menos de 2 h de anticipación
const PASO_MIN = 30;
export const MAX_DIAS = 60;
const ACTIVAS = ["pending", "confirmed", "quote"];

export function hoyMX(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date()); // YYYY-MM-DD
}
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00${OFFSET}`);
  d.setUTCDate(d.getUTCDate() + dias);
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}
export const esFecha = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const esHora = (s: unknown): s is string => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const instante = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00${OFFSET}`);

/** Horas de inicio libres (HH:MM) para un día y una duración. */
export async function horariosDisponibles(fecha: string, duracionMin: number, excluirCitaId?: string): Promise<string[]> {
  const hoy = hoyMX();
  if (!esFecha(fecha) || fecha < hoy || fecha > sumarDias(hoy, MAX_DIAS)) return [];

  const admin = createAdminClient();
  const [y, m, d] = fecha.split("-").map(Number);
  const diaSemana = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo

  const { data: regla } = await admin.from("availability_rules").select("abierto, desde, hasta").eq("dia_semana", diaSemana).maybeSingle();
  if (!regla?.abierto || !regla.desde || !regla.hasta) return [];

  const abre = instante(fecha, String(regla.desde).slice(0, 5));
  const cierra = instante(fecha, String(regla.hasta).slice(0, 5));

  const [{ data: citas }, { data: bloqueos }, { data: repetidos }] = await Promise.all([
    admin.from("appointments").select("id, inicia_en, termina_en").in("estado", ACTIVAS).lt("inicia_en", cierra.toISOString()).gt("termina_en", abre.toISOString()),
    admin.from("blocked_slots").select("inicia_en, termina_en").eq("repite_semanal", false).lt("inicia_en", cierra.toISOString()).gt("termina_en", abre.toISOString()),
    admin.from("blocked_slots").select("inicia_en, termina_en").eq("repite_semanal", true).lte("inicia_en", cierra.toISOString()),
  ]);

  const ocupados: [number, number][] = [];
  for (const r of [...(citas ?? []).filter((c) => c.id !== excluirCitaId), ...(bloqueos ?? [])]) ocupados.push([Date.parse(r.inicia_en), Date.parse(r.termina_en)]);
  const SEMANA = 7 * 24 * 3600 * 1000;
  for (const r of repetidos ?? []) {
    const ini = Date.parse(r.inicia_en), fin = Date.parse(r.termina_en);
    const k = Math.max(0, Math.floor((abre.getTime() - ini) / SEMANA));
    for (const j of [k, k + 1]) ocupados.push([ini + j * SEMANA, fin + j * SEMANA]);
  }

  const libres: string[] = [];
  const minInicio = Date.now() + MIN_ANTICIPACION_MIN * 60000;
  for (let t = abre.getTime(); t + duracionMin * 60000 <= cierra.getTime(); t += PASO_MIN * 60000) {
    const fin = t + duracionMin * 60000;
    if (t < minInicio) continue;
    if (ocupados.some(([a, b]) => t < b && fin > a)) continue;
    libres.push(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(t)));
  }
  return libres;
}
