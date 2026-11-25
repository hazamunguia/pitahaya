"use client";

import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import DiaHoraPicker from "./DiaHoraPicker";
import { horariosCita, reagendarCita } from "@/app/cuenta/(panel)/actions";

export default function ReagendarForm({ folio, hoy, maxFecha, diasAbiertos }: { folio: string; hoy: string; maxFecha: string; diasAbiertos: number[] }) {
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, start] = useTransition();
  const cargar = useCallback((f: string) => horariosCita(folio, f), [folio]);

  function guardar() {
    if (!fecha || !hora) return;
    setError(null);
    start(async () => {
      const r = await reagendarCita(folio, fecha, hora);
      if (r?.error) {
        setError(r.error);
        if (r.refrescar) setHora(null);
      }
    });
  }

  return (
    <>
      <DiaHoraPicker hoy={hoy} maxFecha={maxFecha} diasAbiertos={diasAbiertos} fecha={fecha} hora={hora} onFecha={setFecha} onHora={setHora} cargar={cargar} />
      {error && <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger-text">{error}</p>}
      <div className="flex items-center justify-between">
        <Link href="/cuenta/citas" className="inline-flex min-h-12 items-center px-2 font-bold">Cancelar</Link>
        <button type="button" disabled={!fecha || !hora || enviando} onClick={guardar}
          className="min-h-14 rounded-full border-[1.5px] border-forest bg-forest px-8 text-lg font-bold text-lime shadow-sticker-sm disabled:border-[#e6d6c6] disabled:bg-sunken disabled:text-muted disabled:shadow-none">
          {enviando ? "Guardando…" : "Confirmar cambio"}
        </button>
      </div>
    </>
  );
}
