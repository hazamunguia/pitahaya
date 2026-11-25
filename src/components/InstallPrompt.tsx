"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

const CLAVE = "pitahaya:instalar-despues";

type Modo = "oculto" | "android-directo" | "android-manual" | "ios" | "ios-otro";

function detectar(): Modo {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (standalone) return "oculto";
  try { if (sessionStorage.getItem(CLAVE)) return "oculto"; } catch {}
  const ua = navigator.userAgent;
  const esIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (esIOS) return /CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV/.test(ua) ? "ios-otro" : "ios";
  if (window.__pitahayaInstalar) return "android-directo";
  if (/Android/.test(ua)) return "android-manual";
  return "oculto"; // computadora: no estorbamos
}

export default function InstallPrompt() {
  const [modo, setModo] = useState<Modo>("oculto");

  useEffect(() => {
    const revisar = () => setModo(detectar());
    revisar();
    window.addEventListener("pitahaya:instalar", revisar);
    return () => window.removeEventListener("pitahaya:instalar", revisar);
  }, []);

  if (modo === "oculto") return null;

  function despues() {
    try { sessionStorage.setItem(CLAVE, "1"); } catch {}
    setModo("oculto");
  }

  async function instalar() {
    const ev = window.__pitahayaInstalar;
    if (!ev) return setModo("android-manual");
    await ev.prompt();
    const r = await ev.userChoice.catch(() => null);
    window.__pitahayaInstalar = null;
    if (r?.outcome === "accepted") setModo("oculto");
    else setModo("android-manual");
  }

  return (
    <section aria-label="Instala la app de PITAHAYA" className="mt-6 rounded-lg border-2 border-forest bg-lime p-5 shadow-sticker-sm">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full border-[1.5px] border-forest bg-white">
          <Icon name="sparkles" size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="display text-3xl">Instala la app de PITAHAYA</h2>
          <p className="mt-1 font-semibold">Agenda en un toque y recibe avisos de tus citas, directo desde tu pantalla de inicio.</p>

          {modo === "android-directo" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={instalar} className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-forest bg-forest px-6 font-bold text-lime shadow-sticker-sm">Instalar app</button>
              <button onClick={despues} className="inline-flex min-h-12 items-center rounded-full px-4 font-bold underline">Ahora no</button>
            </div>
          )}

          {modo === "android-manual" && (
            <>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-semibold">
                <li>Toca el menú <b>⋮</b> de Chrome (arriba a la derecha).</li>
                <li>Elige <b>Instalar app</b> o <b>Agregar a pantalla principal</b>.</li>
              </ol>
              <button onClick={despues} className="mt-3 inline-flex min-h-11 items-center font-bold underline">Ahora no</button>
            </>
          )}

          {modo === "ios" && (
            <>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-semibold">
                <li>Toca el botón <b>Compartir</b> (el cuadro con la flecha hacia arriba).</li>
                <li>Elige <b>Agregar a inicio</b> y luego <b>Agregar</b>.</li>
              </ol>
              <button onClick={despues} className="mt-3 inline-flex min-h-11 items-center font-bold underline">Ahora no</button>
            </>
          )}

          {modo === "ios-otro" && (
            <>
              <p className="mt-3 font-semibold">Para instalarla, abre esta página en <b>Safari</b>: toca Compartir y elige <b>Agregar a inicio</b>.</p>
              <button onClick={despues} className="mt-3 inline-flex min-h-11 items-center font-bold underline">Ahora no</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
