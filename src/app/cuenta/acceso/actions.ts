"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone, phoneToEmail } from "@/lib/phone";

export type AuthState = { error?: string };

const MIN_PASSWORD = 8;

export async function entrar(_prev: AuthState, form: FormData): Promise<AuthState> {
  const phone = normalizePhone(String(form.get("celular") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!phone) return { error: "Escribe tu celular de 10 dígitos." };
  if (!password) return { error: "Escribe tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(phone), password });
  if (error) return { error: "Celular o contraseña incorrectos." };

  const { data: perfil } = await supabase.from("profiles").select("role").maybeSingle();
  redirect(perfil?.role === "owner" ? "/gestion" : "/cuenta/citas");
}

export async function crearCuenta(_prev: AuthState, form: FormData): Promise<AuthState> {
  const nombre = String(form.get("nombre") ?? "").trim();
  const phone = normalizePhone(String(form.get("celular") ?? ""));
  const password = String(form.get("password") ?? "");
  if (nombre.length < 2) return { error: "Escribe tu nombre." };
  if (!phone) return { error: "Escribe tu celular de 10 dígitos." };
  if (password.length < MIN_PASSWORD) return { error: `Tu contraseña necesita al menos ${MIN_PASSWORD} caracteres.` };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: phoneToEmail(phone),
    password,
    options: { data: { nombre, celular: phone } },
  });
  if (error) {
    if (/registered|already/i.test(error.message)) return { error: "Ese celular ya tiene cuenta. Entra con tu contraseña." };
    return { error: `No pudimos crear tu cuenta: ${error.message}` };
  }
  if (!data.session) return { error: "Tu cuenta se creó, pero falta activar el acceso. Avísale a Karina." };
  redirect("/cuenta/citas");
}

export async function salir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/cuenta/acceso");
}
