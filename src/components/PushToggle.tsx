"use client";

import { useEffect, useState } from "react";
import { guardarSuscripcion, quitarSuscripcion } from "@/app/push-actions";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function aBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function PushToggle() {
  const [estado, setEstado] = useState<"cargando" | "no-soportado" | "sin-llaves" | "bloqueado" | "apagado" | "activo">("cargando");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!VAPID) return setEstado("sin-llaves");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setEstado("no-soportado");
      if (Notification.permission === "denied") return setEstado("bloqueado");
      const reg = await navigator.serviceWorker.ready;
      setEstado((await reg.pushManager.getSubscription()) ? "activo" : "apagado");
    })();
  }, []);

  async function activar() {
    setMsg(null);
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") return setEstado(permiso === "denied" ? "bloqueado" : "apagado");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(VAPID!) });
    const r = await guardarSuscripcion(sub.toJSON() as never, navigator.userAgent);
    if ("error" in r && r.error) return setMsg(r.error);
    setEstado("activo");
  }
  async function desactivar() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await quitarSuscripcion(sub.endpoint);
      await sub.unsubscribe();
    }
    setEstado("apagado");
  }

  const btn = "min-h-12 rounded-full border-[1.5px] border-forest px-6 font-bold shadow-sticker-sm";
  return (
    <div className="flex flex-col gap-3">
      {estado === "activo" && <button type="button" onClick={desactivar} className={`${btn} self-start bg-white`}>Desactivar avisos en este dispositivo</button>}
      {estado === "apagado" && <button type="button" onClick={activar} className={`${btn} self-start bg-lime`}>Activar avisos en este dispositivo</button>}
      {estado === "cargando" && <p className="font-semibold text-muted">Revisando…</p>}
      {estado === "bloqueado" && <p className="font-semibold text-muted">Los avisos están bloqueados en tu navegador. Actívalos desde los ajustes del sitio.</p>}
      {estado === "no-soportado" && <p className="font-semibold text-muted">Este navegador no admite avisos. En iPhone, primero agrega la app a tu pantalla de inicio (Compartir → Agregar a pantalla de inicio).</p>}
      {estado === "sin-llaves" && <p className="font-semibold text-muted">Los avisos aún no están configurados.</p>}
      {msg && <p role="alert" className="text-sm font-bold text-danger-text">{msg}</p>}
    </div>
  );
}
