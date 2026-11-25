"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { esFecha, esHora, horariosDisponibles, instante } from "@/lib/disponibilidad";
import { getStudioInfo } from "@/lib/studio";
import { avisarDuenas } from "@/lib/push";
import { fechaCorta, horaDeIso } from "@/lib/format";

export type FormState = { error?: string; ok?: string };

async function citaPropia(folio: string) {
  const { supabase, perfil } = await requireUser();
  const { data: cita } = await supabase.from("appointments").select("id, folio, inicia_en, termina_en, estado").eq("folio", folio).maybeSingle();
  return { cita, perfil };
}

async function dentroDePlazo(inicia: string) {
  const { horas_cancelacion } = await getStudioInfo();
  return Date.parse(inicia) - Date.now() >= horas_cancelacion * 3600 * 1000;
}

export async function cancelarCita(formData: FormData) {
  const { cita, perfil } = await citaPropia(String(formData.get("folio") ?? ""));
  if (!cita || !["pending", "confirmed", "quote"].includes(cita.estado)) redirect("/cuenta/citas");
  if (!(await dentroDePlazo(cita.inicia_en))) redirect("/cuenta/citas?aviso=plazo");

  const admin = createAdminClient();
  await admin.from("appointments").update({ estado: "cancelled", motivo_cancelacion: "Cancelada por la clienta" }).eq("id", cita.id);
  await admin.from("status_history").insert({ appointment_id: cita.id, de: cita.estado, a: "cancelled", por: perfil.id });
  await avisarDuenas({ titulo: "Cita cancelada", cuerpo: `${perfil.nombre} canceló su cita del ${fechaCorta(cita.inicia_en)} ${horaDeIso(cita.inicia_en)}`, url: "/gestion/citas" });
  revalidatePath("/cuenta/citas");
  redirect("/cuenta/citas?aviso=cancelada");
}

export async function horariosCita(folio: string, fecha: string): Promise<string[]> {
  if (!esFecha(fecha)) return [];
  const { cita } = await citaPropia(folio);
  if (!cita) return [];
  const minutos = Math.round((Date.parse(cita.termina_en) - Date.parse(cita.inicia_en)) / 60000);
  return horariosDisponibles(fecha, minutos, cita.id);
}

export async function reagendarCita(folio: string, fecha: string, hora: string): Promise<{ error: string; refrescar?: boolean }> {
  if (!esFecha(fecha) || !esHora(hora)) return { error: "Elige un día y una hora válidos." };
  const { cita, perfil } = await citaPropia(folio);
  if (!cita || !["pending", "confirmed", "quote"].includes(cita.estado)) return { error: "Esta cita ya no se puede cambiar." };
  if (!(await dentroDePlazo(cita.inicia_en))) return { error: "Ya pasó el plazo para reagendar. Escríbele a Karina." };

  const minutos = Math.round((Date.parse(cita.termina_en) - Date.parse(cita.inicia_en)) / 60000);
  const libres = await horariosDisponibles(fecha, minutos, cita.id);
  if (!libres.includes(hora)) return { error: "Ese horario ya se ocupó. Elige otro.", refrescar: true };

  const inicia = instante(fecha, hora);
  const termina = new Date(inicia.getTime() + minutos * 60000);
  const admin = createAdminClient();
  const { error } = await admin.from("appointments").update({ inicia_en: inicia.toISOString(), termina_en: termina.toISOString(), estado: "pending" }).eq("id", cita.id);
  if (error) return error.code === "23P01" ? { error: "Ese horario ya se ocupó. Elige otro.", refrescar: true } : { error: "No pudimos reagendar. Intenta de nuevo." };

  await admin.from("status_history").insert({ appointment_id: cita.id, de: cita.estado, a: "pending", por: perfil.id });
  await avisarDuenas({ titulo: "Cita reagendada", cuerpo: `${perfil.nombre} la movió al ${fechaCorta(inicia.toISOString())} ${horaDeIso(inicia.toISOString())}`, url: "/gestion/citas?ver=pendientes" });
  revalidatePath("/cuenta/citas");
  redirect("/cuenta/citas?aviso=reagendada");
}

export async function actualizarNombre(_p: FormState, form: FormData): Promise<FormState> {
  const nombre = String(form.get("nombre") ?? "").trim();
  if (nombre.length < 2) return { error: "Escribe tu nombre." };
  const { supabase, perfil } = await requireUser();
  const { error } = await supabase.from("profiles").update({ nombre: nombre.slice(0, 80) }).eq("id", perfil.id);
  if (error) return { error: "No pudimos guardar tu nombre." };
  revalidatePath("/cuenta", "layout");
  return { ok: "Nombre actualizado." };
}

export async function cambiarPassword(_p: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { error: "Tu contraseña necesita al menos 8 caracteres." };
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  const { supabase, perfil } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "No pudimos cambiar tu contraseña. Intenta de nuevo." };
  await supabase.from("profiles").update({ debe_cambiar_password: false }).eq("id", perfil.id);
  revalidatePath("/cuenta", "layout");
  return { ok: "Contraseña actualizada." };
}
