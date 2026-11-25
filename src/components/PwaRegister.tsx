"use client";

import { useEffect } from "react";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global {
  interface Window { __pitahayaInstalar?: EventoInstalar | null }
}

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    // Guardamos el aviso de instalación del navegador para ofrecerlo en el panel de la clienta.
    const guardar = (e: Event) => {
      e.preventDefault();
      window.__pitahayaInstalar = e as EventoInstalar;
      window.dispatchEvent(new Event("pitahaya:instalar"));
    };
    const instalada = () => {
      window.__pitahayaInstalar = null;
      window.dispatchEvent(new Event("pitahaya:instalar"));
    };
    window.addEventListener("beforeinstallprompt", guardar);
    window.addEventListener("appinstalled", instalada);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardar);
      window.removeEventListener("appinstalled", instalada);
    };
  }, []);
  return null;
}
