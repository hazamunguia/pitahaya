"use server";

import { requireUser } from "@/lib/auth";

type Suscripcion = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function guardarSuscripcion(sub: Suscripcion, userAgent: string) {
  const { supabase, perfil } = await requireUser();
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return { error: "Suscripción inválida." };
  const { error } = await supabase.from("push_subscriptions").upsert(
    { user_id: perfil.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, user_agent: userAgent.slice(0, 200) },
    { onConflict: "endpoint" },
  );
  return error ? { error: "No pudimos activar los avisos." } : { ok: true };
}

export async function quitarSuscripcion(endpoint: string) {
  const { supabase, perfil } = await requireUser();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", perfil.id);
  return { ok: true };
}
