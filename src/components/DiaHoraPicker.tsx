"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import { fechaLarga, hora12 } from "@/lib/format";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const card = "rounded-lg border-[2.5px] border-forest bg-white p-5 shadow-sticker md:p-7";

export default function DiaHoraPicker({ hoy, maxFecha, diasAbiertos, fecha, hora, onFecha, onHora, cargar }: {
  hoy: string; maxFecha: string; diasAbiertos: number[];
  fecha: string | null; hora: string | null;
  onFecha: (f: string) => void; onHora: (h: string | null) => void;
  cargar: (fecha: string) => Promise<string[]>;
}) {
  const [mes, setMes] = useState((fecha ?? hoy).slice(0, 7));
  const [slots, setSlots] = useState<string[] | null>(null);

  useEffect(() => {
    if (!fecha) return;
    let vigente = true;
    setSlots(null);
    cargar(fecha).then((r) => {
      if (vigente) setSlots(r);
    });
    return () => {
      vigente = false;
    };
  }, [fecha, cargar]);

  const [anio, m] = mes.split("-").map(Number);
  const huecos = (new Date(Date.UTC(anio, m - 1, 1)).getUTCDay() + 6) % 7; // semana desde lunes
  const diasMes = new Date(Date.UTC(anio, m, 0)).getUTCDate();
  const mover = (d: number) => setMes(new Date(Date.UTC(anio, m - 1 + d, 1)).toISOString().slice(0, 7));

  return (
    <>
      <div className={card}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="display text-3xl capitalize">{MESES[m - 1]} {anio}</h3>
          <div className="flex gap-2">
            <button type="button" aria-label="Mes anterior" disabled={mes <= hoy.slice(0, 7)} onClick={() => mover(-1)} className="grid size-11 place-items-center rounded-full border-[1.5px] border-forest bg-white disabled:opacity-30"><Icon name="chevron-left" size={20} stroke={2.4} /></button>
            <button type="button" aria-label="Mes siguiente" disabled={mes >= maxFecha.slice(0, 7)} onClick={() => mover(1)} className="grid size-11 place-items-center rounded-full border-[1.5px] border-forest bg-white disabled:opacity-30"><Icon name="chevron-right" size={20} stroke={2.4} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
          {DIAS.map((d, i) => <span key={i} className="pb-1 text-xs font-extrabold text-muted">{d}</span>)}
          {Array.from({ length: huecos }).map((_, i) => <span key={`h${i}`} />)}
          {Array.from({ length: diasMes }).map((_, i) => {
            const dia = i + 1;
            const f = `${mes}-${String(dia).padStart(2, "0")}`;
            const dow = new Date(Date.UTC(anio, m - 1, dia)).getUTCDay();
            const ok = f >= hoy && f <= maxFecha && diasAbiertos.includes(dow);
            const sel = f === fecha;
            return (
              <button key={f} type="button" disabled={!ok} aria-pressed={sel} onClick={() => { onFecha(f); onHora(null); }}
                className={`h-11 rounded-md border-[1.5px] text-base font-bold sm:h-12 md:h-14 ${sel ? "border-forest bg-forest text-lime" : ok ? "border-forest bg-white hover:bg-lime" : "border-transparent text-muted/50 line-through"} ${f === hoy && !sel ? "outline-2 outline-magenta" : ""}`}>
                {dia}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs font-semibold text-muted">Los días tachados no tienen servicio.</p>
      </div>

      {!fecha ? (
        <div className="rounded-lg border-2 border-dashed border-forest bg-cream p-6 font-semibold text-muted">Elige un día para ver los horarios disponibles.</div>
      ) : slots === null ? (
        <div className="h-28 animate-pulse rounded-lg bg-sunken" />
      ) : slots.length === 0 ? (
        <div className="flex items-center gap-3.5 rounded-lg border-2 border-forest bg-blush p-6">
          <Icon name="info" size={28} />
          <div>
            <p className="display text-2xl">Sin horarios este día</p>
            <p className="font-medium">Prueba con otro día.</p>
          </div>
        </div>
      ) : (
        <div className={card}>
          <h3 className="display text-2xl capitalize md:text-3xl">Horarios · {fechaLarga(fecha)}</h3>
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {slots.map((h) => (
              <button key={h} type="button" aria-pressed={hora === h} onClick={() => onHora(h)}
                className={`min-h-12 rounded-md border-[1.5px] border-forest text-base font-bold ${hora === h ? "bg-forest text-lime" : "bg-white hover:bg-lime"}`}>
                {hora12(h)}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
