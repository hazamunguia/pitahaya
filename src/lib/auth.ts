import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Perfil = { id: string; nombre: string; celular: string; role: "owner" | "client"; debe_cambiar_password: boolean };

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/cuenta/acceso");
  const { data: perfil } = await supabase.from("profiles").select("id, nombre, celular, role, debe_cambiar_password").eq("id", data.user.id).single();
  if (!perfil) redirect("/cuenta/acceso");
  return { supabase, user: data.user, perfil: perfil as Perfil };
}

/** Solo la dueña del estudio. Toda acción del panel de gestión debe empezar aquí. */
export async function requireOwner() {
  const ctx = await requireUser();
  if (ctx.perfil.role !== "owner") redirect("/cuenta/citas");
  return ctx;
}

/** Panel de clienta: si Karina le dio una contraseña temporal, primero la cambia. */
export async function requireClient() {
  const ctx = await requireUser();
  if (ctx.perfil.debe_cambiar_password) redirect("/cuenta/perfil?cambiar=1");
  return ctx;
}
