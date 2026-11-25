import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PasoLealtad = { visita: number; tipo: "charm" | "desc" | "premio"; descuento_pct: number | null; texto: string };

export async function pasosLealtad(): Promise<PasoLealtad[]> {
  const { data } = await createAdminClient().from("loyalty_steps").select("visita, tipo, descuento_pct, texto").order("visita");
  return (data as PasoLealtad[]) ?? [];
}

export async function visitasRealizadas(clientId: string): Promise<number> {
  const { count } = await createAdminClient().from("appointments").select("id", { count: "exact", head: true }).eq("client_id", clientId).eq("estado", "done");
  return count ?? 0;
}

/** La visita que toca (1 a 10; después de la 10 el programa vuelve a empezar). */
export function numeroDeVisita(realizadas: number) {
  return (realizadas % 10) + 1;
}

export async function pasoSiguiente(clientId: string) {
  const [pasos, hechas] = await Promise.all([pasosLealtad(), visitasRealizadas(clientId)]);
  const n = numeroDeVisita(hechas);
  return { visita: n, paso: pasos.find((p) => p.visita === n) ?? null, hechas };
}
