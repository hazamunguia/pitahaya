import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";

// Cliente público (sin cookies): solo lee catálogos que las reglas de seguridad dejan ver a todos.
function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
}

export type Service = { id: string; slug: string; nombre: string; descripcion: string | null; duracion_min: number; precio_base: number; admite_diseno: boolean };
export type Courtesy = { id: string; nombre: string; icono: string | null };
export type Design = { id: string; nombre: string; precio_extra: number };

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");
  const { data } = await publicClient().from("services").select("id, slug, nombre, descripcion, duracion_min, precio_base, admite_diseno").eq("visible", true).order("orden");
  return (data as Service[]) ?? [];
}

export async function getCourtesies(): Promise<Courtesy[]> {
  "use cache";
  cacheLife("minutes");
  const { data } = await publicClient().from("courtesies").select("id, nombre, icono").eq("disponible", true).order("orden");
  return (data as Courtesy[]) ?? [];
}

export async function getDesigns(): Promise<Design[]> {
  "use cache";
  cacheLife("minutes");
  const { data } = await publicClient().from("designs").select("id, nombre, precio_extra").eq("visible", true).order("orden");
  return (data as Design[]) ?? [];
}

export function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
