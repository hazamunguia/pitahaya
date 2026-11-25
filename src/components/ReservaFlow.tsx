"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import DiaHoraPicker from "./DiaHoraPicker";
import { duracion, fechaLarga, hora12, money } from "@/lib/format";
import Icon from "./Icon";
import { crearCita, horarios } from "@/app/reservar/actions";

type Servicio = { id: string; nombre: string; descripcion: string | null; duracion_min: number; precio_base: number; admite_diseno: boolean };
type Diseno = { id: string; nombre: string; precio_extra: number };
type Cortesia = { id: string; nombre: string; icono: string | null };

const card = "rounded-lg border-[2.5px] border-forest bg-white p-5 shadow-sticker md:p-7";
const tile = (on: boolean) =>
  `rounded-lg border-[2.5px] bg-white text-left transition-transform ${on ? "border-magenta shadow-[4px_4px_0_var(--color-magenta)]" : "border-forest shadow-sticker-sm hover:-translate-y-0.5"}`;

export default function ReservaFlow({ nombre, hoy, maxFecha, diasAbiertos, servicios, disenos, cortesias, lealtad }: {
  nombre: string; hoy: string; maxFecha: string; diasAbiertos: number[];
  lealtad: { visita: number; texto: string; descuento_pct: number } | null;
  servicios: Servicio[]; disenos: Diseno[]; cortesias: Cortesia[];
}) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [designId, setDesignId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [courtesyIds, setCourtesyIds] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paso, setPaso] = useState(0);
  const [enviando, startEnviar] = useTransition();

  const servicio = servicios.find((s) => s.id === serviceId) ?? null;
  const diseno = disenos.find((d) => d.id === designId) ?? null;
  const pasos = useMemo(
    () => (servicio?.admite_diseno ? ["servicio", "diseno", "dia", "cortesia", "confirmar"] : ["servicio", "dia", "cortesia", "confirmar"]) as string[],
    [servicio],
  );
  const NOMBRES: Record<string, string> = { servicio: "Servicio", diseno: "Diseño", dia: "Día y hora", cortesia: "Cortesía", confirmar: "Confirmar" };
  const actual = pasos[Math.min(paso, pasos.length - 1)];
  const subtotal = servicio ? Number(servicio.precio_base) + Number(diseno?.precio_extra ?? 0) : 0;
  const pct = lealtad?.descuento_pct ?? 0;
  const total = Math.round(subtotal * (1 - pct / 100) * 100) / 100;
  const nombresCortesia = cortesias.filter((c) => courtesyIds.includes(c.id)).map((c) => c.nombre);

  const cargar = useCallback((f: string) => horarios(f, serviceId ?? "", designId), [serviceId, designId]);

  const puedeContinuar =
    (actual === "servicio" && !!servicio) ||
    actual === "diseno" ||
    (actual === "dia" && !!fecha && !!hora) ||
    (actual === "cortesia" && courtesyIds.length >= 1) ||
    (actual === "confirmar" && acepto);

  function elegirServicio(id: string) {
    setServiceId(id);
    const s = servicios.find((x) => x.id === id);
    if (!s?.admite_diseno) setDesignId(null);
    setHora(null);
  }
  function toggleCortesia(id: string) {
    setCourtesyIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 2 ? cur : [...cur, id]));
  }
  function confirmar() {
    if (!serviceId || !fecha || !hora) return;
    setError(null);
    startEnviar(async () => {
      const r = await crearCita({ fecha, hora, serviceId, designId, courtesyIds, nota });
      if (r?.error) {
        setError(r.error);
        if (r.refrescar) {
          setHora(null);
          setPaso(pasos.indexOf("dia"));
        }
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-10 md:px-10 md:pt-14">
      <p className="text-xs font-extrabold uppercase tracking-[.14em]">Reserva en línea</p>
      <h1 className="display mt-3 text-6xl md:text-8xl">Agenda tu cita</h1>
      <p className="mt-3 text-lg font-semibold text-muted">Hola, {nombre.split(" ")[0]}. En unos pasos queda lista.</p>

      <ol className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="Pasos">
        {pasos.map((p, i) => (
          <li key={p} aria-current={i === paso ? "step" : undefined} className={`flex shrink-0 items-center gap-2 rounded-full border-[1.5px] border-forest px-4 py-2 text-sm font-bold ${i === paso ? "bg-forest text-lime" : i < paso ? "bg-lime text-forest" : "bg-cream text-muted"}`}>
            <span className="grid size-6 place-items-center rounded-full bg-white/20 text-xs">{i < paso ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>
            {NOMBRES[p]}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-5">
          {actual === "servicio" && (
            <>
              <h2 className="display text-4xl md:text-5xl">Elige tu servicio</h2>
              <div className="flex flex-col gap-3.5">
                {servicios.map((s) => (
                  <button key={s.id} type="button" onClick={() => elegirServicio(s.id)} aria-pressed={serviceId === s.id} className={`${tile(serviceId === s.id)} flex items-center gap-4 p-4 md:p-5`}>
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] ${serviceId === s.id ? "border-magenta bg-magenta text-white" : "border-forest"}`}>
                      {serviceId === s.id && <Icon name="check" size={18} stroke={3} />}
                    </span>
                    <span className="flex-1">
                      <span className="display block text-2xl md:text-3xl">{s.nombre}</span>
                      <span className="mt-1 flex flex-wrap gap-x-4 text-sm font-semibold text-muted">
                        <span className="inline-flex items-center gap-1.5"><Icon name="clock" size={16} />{duracion(s.duracion_min)}</span>
                        {s.admite_diseno && <span>Admite diseño</span>}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="display block text-2xl text-magenta-deep md:text-3xl">{money(s.precio_base)}</span>
                      <span className="text-[11px] font-bold tracking-wider text-muted">PRECIO BASE</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {actual === "diseno" && (
            <>
              <h2 className="display text-4xl md:text-5xl">Dale estilo a tus uñas</h2>
              <p className="font-semibold text-muted">Elige un diseño de la casa o déjalo sin diseño.</p>
              <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
                <button type="button" onClick={() => setDesignId(null)} aria-pressed={designId === null} className={`${tile(designId === null)} flex flex-col gap-2 p-3.5`}>
                  <span className="grid h-24 place-items-center rounded-md bg-cream"><Icon name="x" size={30} stroke={1.8} /></span>
                  <span className="display text-xl">Sin diseño</span>
                  <span className="text-sm font-bold text-muted">Sin costo extra</span>
                </button>
                {disenos.map((d) => (
                  <button key={d.id} type="button" onClick={() => setDesignId(d.id)} aria-pressed={designId === d.id} className={`${tile(designId === d.id)} flex flex-col gap-2 p-3.5`}>
                    <span className="grid h-24 place-items-center rounded-md bg-blush"><Icon name="palette" size={32} stroke={1.8} /></span>
                    <span className="display text-xl">{d.nombre}</span>
                    <span className="text-sm font-bold text-muted">{Number(d.precio_extra) ? `+${money(d.precio_extra)}` : "Sin costo extra"}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-muted">¿Quieres un diseño de tu foto? Pronto podrás subirla aquí. Mientras, cuéntaselo a Karina en las notas del último paso.</p>
            </>
          )}

          {actual === "dia" && (
            <>
              <h2 className="display text-4xl md:text-5xl">Elige día y hora</h2>
              <DiaHoraPicker hoy={hoy} maxFecha={maxFecha} diasAbiertos={diasAbiertos} fecha={fecha} hora={hora} onFecha={setFecha} onHora={setHora} cargar={cargar} />
            </>
          )}

          {actual === "cortesia" && (
            <>
              <h2 className="display text-4xl md:text-5xl">¿Qué te preparamos?</h2>
              <p className="font-semibold text-muted">Cada cita incluye cortesía de la casa. Elige hasta 2.</p>
              <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
                {cortesias.map((c) => {
                  const on = courtesyIds.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCortesia(c.id)} aria-pressed={on} className={`${tile(on)} ${on ? "!bg-lime" : ""} flex flex-col items-center gap-3 px-3 py-7`}>
                      <Icon name={c.icono ?? "sparkles"} size={44} stroke={1.7} />
                      <span className="display text-center text-xl md:text-2xl">{c.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {actual === "confirmar" && (
            <>
              <h2 className="display text-4xl md:text-5xl">Casi lista</h2>
              <div className={`${card} flex flex-col gap-5`}>
                <label className="flex flex-col gap-1.5 text-sm font-bold">
                  Notas para Karina (opcional)
                  <textarea value={nota} onChange={(e) => setNota(e.target.value)} maxLength={500} rows={4} placeholder="Ej. alergia a algún producto, forma de uña que prefieres, o describe el diseño que quieres"
                    className="w-full rounded-md border-[1.5px] border-forest bg-white p-4 text-base font-medium focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-magenta" />
                </label>
                <label className="flex items-start gap-3 text-sm font-semibold leading-relaxed">
                  <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} className="mt-0.5 size-6 shrink-0 accent-forest" />
                  Acepto las políticas de reagendar y cancelar del estudio.
                </label>
              </div>
            </>
          )}

          {error && <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger-text">{error}</p>}

          <div className="mt-2 flex items-center justify-between">
            {paso > 0 ? (
              <button type="button" onClick={() => { setError(null); setPaso(paso - 1); }} className="inline-flex min-h-12 items-center gap-1 px-2 font-bold">
                <Icon name="chevron-left" size={20} stroke={2.4} /> Atrás
              </button>
            ) : <span />}
            {actual === "confirmar" ? (
              <button type="button" disabled={!puedeContinuar || enviando} onClick={confirmar}
                className="inline-flex min-h-14 items-center gap-2 rounded-full border-[1.5px] border-forest bg-forest px-8 text-lg font-bold text-lime shadow-sticker-sm disabled:border-[#e6d6c6] disabled:bg-sunken disabled:text-muted disabled:shadow-none">
                {enviando ? "Agendando…" : "Confirmar cita"} <Icon name="arrow-right" size={22} stroke={2.4} />
              </button>
            ) : (
              <button type="button" disabled={!puedeContinuar} onClick={() => { setError(null); setPaso(paso + 1); }}
                className="inline-flex min-h-14 items-center gap-2 rounded-full border-[1.5px] border-forest bg-forest px-8 text-lg font-bold text-lime shadow-sticker-sm disabled:border-[#e6d6c6] disabled:bg-sunken disabled:text-muted disabled:shadow-none">
                Continuar <Icon name="arrow-right" size={22} stroke={2.4} />
              </button>
            )}
          </div>
        </section>

        <aside className="rounded-lg border-[2.5px] border-forest bg-cream p-6 shadow-sticker lg:sticky lg:top-6">
          <h2 className="display text-3xl">Tu cita</h2>
          <dl className="mt-4 divide-y divide-forest/15 text-[15px]">
            {[
              ["Día", fecha ? fechaLarga(fecha) : "—"],
              ["Hora", hora ? hora12(hora) : "—"],
              ["Servicio", servicio ? `${servicio.nombre} · ${duracion(servicio.duracion_min)}` : "—"],
              ["Diseño", servicio?.admite_diseno ? (diseno ? `${diseno.nombre}${Number(diseno.precio_extra) ? ` (+${money(diseno.precio_extra)})` : ""}` : "Sin diseño") : "—"],
              ["Cortesía", nombresCortesia.length ? nombresCortesia.join(" y ") : "—"],
              ...(lealtad ? [["Esta cita te da", `${lealtad.texto}`]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="font-bold text-muted">{k}</dt>
                <dd className="text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          {pct > 0 && subtotal > 0 && <p className="mt-3 text-sm font-bold text-magenta-deep">Descuento de tu programa: {pct}% (−{money(subtotal - total)})</p>}
          <div className="mt-3 flex items-baseline justify-between border-t-2 border-forest pt-4">
            <span className="text-sm font-extrabold tracking-widest">TOTAL</span>
            <span className="display text-4xl text-magenta-deep">{money(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
