"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { esFecha, esHora, horariosDisponibles, instante } from "@/lib/disponibilidad";
import { pasoSiguiente } from "@/lib/lealtad";
import { avisarDuenas } from "@/lib/push";
import { fechaCorta, horaDeIso } from "@/lib/format";

export type CitaInput = {
  fecha: string;
  hora: string;
  serviceId: string;
  designId: string | null;
  courtesyIds: string[];
  nota: string;
};
export type CitaResultado = { error: string; refrescar?: boolean };

async function duracionTotal(serviceId: string, designId: string | null) {
  const admin = createAdminClient();
  const { data: servicio } = await admin.from("services").select("id, duracion_min, precio_base, admite_diseno").eq("id", serviceId).eq("visible", true).maybeSingle();
  if (!servicio) return null;
  let diseno: { id: string; precio_extra: number; minutos_extra: number } | null = null;
  if (designId) {
    if (!servicio.admite_diseno) return null;
    const { data } = await admin.from("designs").select("id, precio_extra, minutos_extra").eq("id", designId).eq("visible", true).maybeSingle();
    if (!data) return null;
    diseno = data;
  }
  return { servicio, diseno, minutos: servicio.duracion_min + (diseno?.minutos_extra ?? 0) };
}

/** Horarios libres de un día para el servicio (y diseño) elegidos. */
export async function horarios(fecha: string, serviceId: string, designId: string | null): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims || !esFecha(fecha)) return [];
  const calc = await duracionTotal(serviceId, designId);
  if (!calc) return [];
  return horariosDisponibles(fecha, calc.minutos);
}

/** Crea la cita. El precio y la duración se calculan aquí, nunca se toman del navegador. */
export async function crearCita(input: CitaInput): Promise<CitaResultado> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/cuenta/acceso?next=/reservar");

  if (!esFecha(input.fecha) || !esHora(input.hora)) return { error: "Elige un día y una hora válidos." };
  const calc = await duracionTotal(input.serviceId, input.designId || null);
  if (!calc) return { error: "Ese servicio o diseño ya no está disponible. Elige de nuevo." };

  const ids = [...new Set(input.courtesyIds)];
  if (ids.length < 1 || ids.length > 2) return { error: "Elige entre 1 y 2 cortesías." };

  const admin = createAdminClient();
  const { data: cortesias } = await admin.from("courtesies").select("id").in("id", ids).eq("disponible", true);
  if ((cortesias?.length ?? 0) !== ids.length) return { error: "Una de las cortesías ya no está disponible." };

  const libres = await horariosDisponibles(input.fecha, calc.minutos);
  if (!libres.includes(input.hora)) return { error: "Ese horario ya se ocupó. Elige otro del mismo día.", refrescar: true };

  const inicia = instante(input.fecha, input.hora);
  const termina = new Date(inicia.getTime() + calc.minutos * 60000);
  const base = Number(calc.servicio.precio_base);
  const extra = Number(calc.diseno?.precio_extra ?? 0);
  const sig = await pasoSiguiente(user.id);
  const pct = sig.paso?.tipo === "desc" ? Number(sig.paso.descuento_pct ?? 0) : 0;
  const total = Math.round((base + extra) * (1 - pct / 100) * 100) / 100;

  const { data: cita, error } = await admin
    .from("appointments")
    .insert({
      client_id: user.id,
      service_id: calc.servicio.id,
      design_id: calc.diseno?.id ?? null,
      inicia_en: inicia.toISOString(),
      termina_en: termina.toISOString(),
      precio_base: base,
      precio_diseno: extra,
      descuento_pct: pct,
      total,
      nota_clienta: input.nota.trim().slice(0, 500) || null,
      origen: "web",
    })
    .select("id, folio")
    .single();

  if (error || !cita) {
    if (error?.code === "23P01") return { error: "Ese horario ya se ocupó. Elige otro del mismo día.", refrescar: true };
    return { error: "No pudimos guardar tu cita. Intenta de nuevo." };
  }

  await admin.from("appointment_courtesies").insert(ids.map((courtesy_id) => ({ appointment_id: cita.id, courtesy_id })));
  await admin.from("status_history").insert({ appointment_id: cita.id, de: null, a: "pending", por: user.id });

  const { data: perfil } = await admin.from("profiles").select("nombre").eq("id", user.id).maybeSingle();
  await avisarDuenas({ titulo: "Nueva cita", cuerpo: `${perfil?.nombre ?? "Una clienta"} · ${fechaCorta(inicia.toISOString())} ${horaDeIso(inicia.toISOString())}`, url: "/gestion/citas?ver=pendientes" });

  redirect(`/reservar/${cita.folio}`);
}
