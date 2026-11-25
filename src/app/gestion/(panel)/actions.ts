"use server";

import { randomBytes, randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { avisar } from "@/lib/push";
import { esFecha, esHora, instante } from "@/lib/disponibilidad";
import { fechaCorta, horaDeIso } from "@/lib/format";
import { visitasRealizadas, pasosLealtad } from "@/lib/lealtad";
import type { OwnerState } from "@/components/OwnerForm";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string, def = 0) => {
  const n = Number(String(f.get(k) ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : def;
};
const bool = (f: FormData, k: string) => f.get(k) === "on";
const refrescar = () => revalidatePath("/gestion", "layout");

/* ---------------- Citas ---------------- */

const TRANSICIONES: Record<string, string[]> = {
  pending: ["confirmed", "cancelled", "done"],
  quote: ["confirmed", "cancelled"],
  confirmed: ["done", "cancelled"],
};
const AVISO_CLIENTA: Record<string, [string, string]> = {
  confirmed: ["Tu cita está confirmada", "Karina confirmó tu cita. ¡Te esperamos!"],
  cancelled: ["Tu cita se canceló", "Karina canceló tu cita. Escríbele para reagendar."],
  done: ["¡Gracias por venir!", "Revisa tus charms en tu cuenta."],
};

export async function cambiarEstado(form: FormData) {
  const { perfil } = await requireOwner();
  const folio = txt(form, "folio"), nuevo = txt(form, "estado");
  const admin = createAdminClient();
  const { data: cita } = await admin.from("appointments").select("id, client_id, estado, inicia_en").eq("folio", folio).maybeSingle();
  if (!cita || !TRANSICIONES[cita.estado]?.includes(nuevo)) return refrescar();

  await admin.from("appointments").update({ estado: nuevo, ...(nuevo === "cancelled" ? { motivo_cancelacion: "Cancelada por el estudio" } : {}) }).eq("id", cita.id);
  await admin.from("status_history").insert({ appointment_id: cita.id, de: cita.estado, a: nuevo, por: perfil.id });

  if (nuevo === "done") {
    const [hechas, pasos] = await Promise.all([visitasRealizadas(cita.client_id), pasosLealtad()]);
    const visita = ((hechas - 1) % 10) + 1;
    const paso = pasos.find((p) => p.visita === visita);
    const { data: ya } = await admin.from("loyalty_events").select("id").eq("appointment_id", cita.id).maybeSingle();
    if (paso && !ya) await admin.from("loyalty_events").insert({ client_id: cita.client_id, appointment_id: cita.id, visita_n: visita, tipo: paso.tipo });
  }
  const [titulo, cuerpo] = AVISO_CLIENTA[nuevo];
  await avisar([cita.client_id], { titulo, cuerpo: `${cuerpo} (${fechaCorta(cita.inicia_en)} ${horaDeIso(cita.inicia_en)})`, url: "/cuenta/citas" });
  refrescar();
}

export async function crearCitaManual(_p: OwnerState, form: FormData): Promise<OwnerState> {
  const { perfil } = await requireOwner();
  const clientId = txt(form, "client_id"), serviceId = txt(form, "service_id"), designId = txt(form, "design_id") || null;
  const fecha = txt(form, "fecha"), hora = txt(form, "hora");
  if (!clientId || !serviceId) return { error: "Elige clienta y servicio." };
  if (!esFecha(fecha) || !esHora(hora)) return { error: "Escribe una fecha y hora válidas." };

  const admin = createAdminClient();
  const { data: servicio } = await admin.from("services").select("id, duracion_min, precio_base").eq("id", serviceId).maybeSingle();
  if (!servicio) return { error: "Ese servicio no existe." };
  let extra = 0, minExtra = 0;
  if (designId) {
    const { data: d } = await admin.from("designs").select("precio_extra, minutos_extra").eq("id", designId).maybeSingle();
    if (!d) return { error: "Ese diseño no existe." };
    extra = Number(d.precio_extra); minExtra = d.minutos_extra;
  }
  const pct = Math.min(100, Math.max(0, num(form, "descuento_pct")));
  const inicia = instante(fecha, hora);
  const termina = new Date(inicia.getTime() + (servicio.duracion_min + minExtra) * 60000);
  const base = Number(servicio.precio_base);
  const { data: cita, error } = await admin.from("appointments").insert({
    client_id: clientId, service_id: serviceId, design_id: designId,
    inicia_en: inicia.toISOString(), termina_en: termina.toISOString(),
    estado: "confirmed", precio_base: base, precio_diseno: extra, descuento_pct: pct,
    total: Math.round((base + extra) * (1 - pct / 100) * 100) / 100,
    nota_interna: txt(form, "nota") || null, origen: "manual",
  }).select("id").single();
  if (error || !cita) return { error: error?.code === "23P01" ? "Ese horario se empalma con otra cita." : "No se pudo crear la cita." };
  await admin.from("status_history").insert({ appointment_id: cita.id, de: null, a: "confirmed", por: perfil.id });
  refrescar();
  redirect("/gestion/citas?ver=proximas");
}

/* ---------------- Clientas ---------------- */

export async function guardarFicha(_p: OwnerState, form: FormData): Promise<OwnerState> {
  const { perfil } = await requireOwner();
  const clientId = txt(form, "client_id");
  const admin = createAdminClient();
  const { error } = await admin.from("beauty_profiles").upsert({
    client_id: clientId, tone_id: txt(form, "tone_id") || null,
    forma: txt(form, "forma") || null, largo: txt(form, "largo") || null, notas: txt(form, "notas") || null,
    actualizado_en: new Date().toISOString(), actualizado_por: perfil.id,
  });
  if (error) return { error: "No se pudo guardar la ficha." };

  const filas: { client_id: string; mano: string; dedo: number; medida_mm: number }[] = [];
  const vacias: [string, number][] = [];
  for (const mano of ["L", "R"]) for (let dedo = 1; dedo <= 5; dedo++) {
    const v = num(form, `m_${mano}_${dedo}`, 0);
    if (v > 0) filas.push({ client_id: clientId, mano, dedo, medida_mm: v });
    else vacias.push([mano, dedo]);
  }
  if (filas.length) await admin.from("nail_measurements").upsert(filas);
  for (const [mano, dedo] of vacias) await admin.from("nail_measurements").delete().eq("client_id", clientId).eq("mano", mano).eq("dedo", dedo);
  refrescar();
  return { ok: "Ficha guardada." };
}

const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789"; // sin letras ni números que se confunden
export type TempState = { error?: string; password?: string };

export async function contrasenaTemporal(_p: TempState, form: FormData): Promise<TempState> {
  await requireOwner();
  const id = txt(form, "client_id");
  const temporal = Array.from({ length: 8 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: temporal });
  if (error) return { error: "No se pudo generar la contraseña." };
  await admin.from("profiles").update({ debe_cambiar_password: true }).eq("id", id);
  return { password: temporal };
}

/* ---------------- Catálogo ---------------- */

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30) || "servicio";

export async function guardarServicio(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const id = txt(form, "id"), nombre = txt(form, "nombre");
  const duracion = Math.round(num(form, "duracion_min")), precio = num(form, "precio_base");
  if (nombre.length < 2) return { error: "Escribe el nombre." };
  if (duracion < 15 || duracion > 600) return { error: "La duración va de 15 a 600 minutos." };
  if (precio < 0) return { error: "El precio no puede ser negativo." };
  const fila = { nombre, descripcion: txt(form, "descripcion") || null, duracion_min: duracion, precio_base: precio, admite_diseno: bool(form, "admite_diseno"), visible: bool(form, "visible"), orden: Math.round(num(form, "orden")) };
  const { error } = id
    ? await createAdminClient().from("services").update(fila).eq("id", id)
    : await createAdminClient().from("services").insert({ ...fila, slug: `${slug(nombre)}-${randomBytes(2).toString("hex")}` });
  if (error) return { error: "No se pudo guardar." };
  updateTag("catalogo"); refrescar();
  return { ok: "Guardado." };
}

export async function guardarDiseno(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const id = txt(form, "id"), nombre = txt(form, "nombre");
  if (nombre.length < 2) return { error: "Escribe el nombre." };
  const fila = { nombre, precio_extra: Math.max(0, num(form, "precio_extra")), minutos_extra: Math.max(0, Math.round(num(form, "minutos_extra"))), visible: bool(form, "visible"), orden: Math.round(num(form, "orden")) };
  const { error } = id
    ? await createAdminClient().from("designs").update(fila).eq("id", id)
    : await createAdminClient().from("designs").insert(fila);
  if (error) return { error: "No se pudo guardar." };
  updateTag("catalogo"); refrescar();
  return { ok: "Guardado." };
}

export async function guardarCortesia(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const id = txt(form, "id"), nombre = txt(form, "nombre");
  if (nombre.length < 2) return { error: "Escribe el nombre." };
  const fila = { nombre, icono: txt(form, "icono") || "sparkles", disponible: bool(form, "disponible"), orden: Math.round(num(form, "orden")) };
  const { error } = id
    ? await createAdminClient().from("courtesies").update(fila).eq("id", id)
    : await createAdminClient().from("courtesies").insert(fila);
  if (error) return { error: "No se pudo guardar." };
  updateTag("catalogo"); refrescar();
  return { ok: "Guardado." };
}

/* ---------------- Horario y ajustes ---------------- */

export async function guardarHorario(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const filas = [];
  for (let d = 0; d <= 6; d++) {
    const abierto = bool(form, `abierto_${d}`);
    const desde = txt(form, `desde_${d}`), hasta = txt(form, `hasta_${d}`);
    if (abierto && (!esHora(desde) || !esHora(hasta) || desde >= hasta)) return { error: "Revisa las horas: la hora de cierre debe ser después de la apertura." };
    filas.push({ dia_semana: d, abierto, desde: abierto ? desde : null, hasta: abierto ? hasta : null });
  }
  const { error } = await createAdminClient().from("availability_rules").upsert(filas);
  if (error) return { error: "No se pudo guardar el horario." };
  updateTag("catalogo"); refrescar();
  return { ok: "Horario guardado." };
}

export async function agregarBloqueo(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const fecha = txt(form, "fecha");
  const todo = bool(form, "todo_el_dia");
  const desde = todo ? "00:00" : txt(form, "desde"), hasta = todo ? "23:59" : txt(form, "hasta");
  if (!esFecha(fecha) || !esHora(desde) || !esHora(hasta) || desde >= hasta) return { error: "Revisa la fecha y las horas." };
  const { error } = await createAdminClient().from("blocked_slots").insert({
    inicia_en: instante(fecha, desde).toISOString(), termina_en: instante(fecha, hasta).toISOString(),
    motivo: txt(form, "motivo") || null, repite_semanal: bool(form, "repite_semanal"),
  });
  if (error) return { error: "No se pudo guardar el bloqueo." };
  refrescar();
  return { ok: "Bloqueo agregado." };
}

export async function eliminarBloqueo(form: FormData) {
  await requireOwner();
  await createAdminClient().from("blocked_slots").delete().eq("id", txt(form, "id"));
  refrescar();
}

export async function guardarAjustes(_p: OwnerState, form: FormData): Promise<OwnerState> {
  await requireOwner();
  const horas = Math.round(num(form, "horas_cancelacion", 24));
  if (horas < 0 || horas > 240) return { error: "Las horas de anticipación van de 0 a 240." };
  const filas = [
    { clave: "ciudad", valor: txt(form, "ciudad") },
    { clave: "direccion", valor: txt(form, "direccion") },
    { clave: "telefono", valor: txt(form, "telefono").replace(/[^\d+ ]/g, "") },
    { clave: "horas_cancelacion", valor: horas },
  ];
  const { error } = await createAdminClient().from("settings").upsert(filas);
  if (error) return { error: "No se pudieron guardar los ajustes." };
  updateTag("studio"); refrescar();
  return { ok: "Ajustes guardados." };
}
