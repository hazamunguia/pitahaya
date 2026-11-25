import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type StudioInfo = { ciudad: string; direccion: string; telefono: string; horas_cancelacion: number };
export const STUDIO_DEFAULTS: StudioInfo = { ciudad: "", direccion: "", telefono: "", horas_cancelacion: 24 };

/** Datos públicos del estudio (los edita Karina en Ajustes). */
export async function getStudioInfo(): Promise<StudioInfo> {
  "use cache";
  cacheLife("minutes");
  cacheTag("studio");
  const info = { ...STUDIO_DEFAULTS };
  let filas: { clave: string; valor: unknown }[] = [];
  try {
    const { data } = await createAdminClient().from("settings").select("clave, valor").in("clave", ["ciudad", "direccion", "telefono", "horas_cancelacion"]);
    filas = data ?? [];
  } catch {
    /* sin llave de servidor (p. ej. en local): se usan los valores por defecto */
  }
  for (const r of filas) {
    if (r.clave === "horas_cancelacion") info.horas_cancelacion = Number(r.valor) || 24;
    else (info as Record<string, string | number>)[r.clave] = String(r.valor ?? "");
  }
  return info;
}

/** WhatsApp: solo dígitos, con lada de México. */
export function waLink(telefono: string, texto?: string) {
  const d = telefono.replace(/\D/g, "");
  const n = d.length === 10 ? `52${d}` : d;
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
