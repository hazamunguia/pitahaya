import "server-only";
import * as webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export type Aviso = { titulo: string; cuerpo?: string; url?: string };

let configurado: boolean | null = null;
function configurar() {
  if (configurado !== null) return configurado;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (pub && priv) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:hola@pitahaya.app", pub, priv);
    configurado = true;
  } else configurado = false;
  return configurado;
}

/** Guarda el aviso en la cuenta y, si hay llaves VAPID, lo manda como notificación al celular. Nunca lanza error. */
export async function avisar(userIds: string[], aviso: Aviso) {
  try {
    if (!userIds.length) return;
    const admin = createAdminClient();
    await admin.from("notifications").insert(userIds.map((user_id) => ({ user_id, titulo: aviso.titulo, cuerpo: aviso.cuerpo ?? null, url: aviso.url ?? null })));
    if (!configurar()) return;
    const { data: subs } = await admin.from("push_subscriptions").select("id, endpoint, p256dh, auth").in("user_id", userIds);
    const payload = JSON.stringify(aviso);
    await Promise.all(
      (subs ?? []).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }),
    );
  } catch {
    /* los avisos son un extra: si fallan, la cita igual se guardó */
  }
}

export async function avisarDuenas(aviso: Aviso) {
  const { data } = await createAdminClient().from("profiles").select("id").eq("role", "owner");
  await avisar((data ?? []).map((p) => p.id), aviso);
}
