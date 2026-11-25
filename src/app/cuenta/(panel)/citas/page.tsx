import Link from "next/link";
import { requireClient } from "@/lib/auth";
import { fechaHoraLarga, money } from "@/lib/format";
import { getStudioInfo, waLink } from "@/lib/studio";
import StatusBadge from "@/components/StatusBadge";
import { cancelarCita } from "../actions";

export const metadata = { title: "Mis citas" };
export const instant = false;

const AVISOS: Record<string, string> = {
  cancelada: "Tu cita se canceló.",
  reagendada: "Listo, movimos tu cita. Karina la confirmará de nuevo.",
  plazo: "Ya pasó el plazo para cancelar. Escríbele a Karina.",
};

type Cita = { folio: string; inicia_en: string; estado: string; total: number; services: { nombre: string } | null; designs: { nombre: string } | null };

export default async function MisCitasPage({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const { supabase } = await requireClient();
  const { aviso } = await searchParams;
  const [{ data }, studio] = await Promise.all([
    supabase.from("appointments").select("folio, inicia_en, estado, total, services(nombre), designs(nombre)").order("inicia_en", { ascending: false }).limit(50),
    getStudioInfo(),
  ]);
  const citas = (data ?? []) as unknown as Cita[];
  const ahora = Date.now();
  const proximas = citas.filter((c) => Date.parse(c.inicia_en) >= ahora && ["pending", "confirmed", "quote"].includes(c.estado)).reverse();
  const historial = citas.filter((c) => !proximas.includes(c));
  const puedeCambiar = (c: Cita) => Date.parse(c.inicia_en) - ahora >= studio.horas_cancelacion * 3600 * 1000;

  return (
    <div className="flex flex-col gap-8">
      {aviso && AVISOS[aviso] && <p role="status" className="rounded-md border-[1.5px] border-forest bg-lime px-4 py-3 font-bold">{AVISOS[aviso]}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-4xl">Próximas citas</h2>
        <Link href="/reservar" className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-forest bg-forest px-6 font-bold text-lime shadow-sticker-sm">Agendar cita</Link>
      </div>

      {proximas.length === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-forest bg-white p-6 font-semibold text-muted">No tienes citas próximas.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {proximas.map((c) => (
            <li key={c.folio} className="rounded-lg border-[2.5px] border-forest bg-white p-5 shadow-sticker-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="display text-3xl">{c.services?.nombre}</p>
                  <p className="mt-1 font-semibold capitalize">{fechaHoraLarga(c.inicia_en)}</p>
                  <p className="text-sm font-semibold text-muted">{c.designs ? `Diseño: ${c.designs.nombre} · ` : ""}{c.folio} · {money(c.total)}</p>
                </div>
                <StatusBadge estado={c.estado} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {puedeCambiar(c) ? (
                  <>
                    <Link href={`/cuenta/citas/${c.folio}/reagendar`} className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-forest bg-cream px-5 text-sm font-bold">Reagendar</Link>
                    <form action={cancelarCita}>
                      <input type="hidden" name="folio" value={c.folio} />
                      <button className="min-h-11 rounded-full border-[1.5px] border-forest bg-white px-5 text-sm font-bold text-danger-text">Cancelar cita</button>
                    </form>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-muted">
                    Con menos de {studio.horas_cancelacion} h de anticipación, los cambios se piden directo a Karina.
                    {studio.telefono && <> <a href={waLink(studio.telefono, `Hola Karina, sobre mi cita ${c.folio}…`)} className="font-bold text-forest underline">Escribir por WhatsApp</a></>}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {historial.length > 0 && (
        <>
          <h2 className="display text-4xl">Historial</h2>
          <ul className="flex flex-col gap-3">
            {historial.map((c) => (
              <li key={c.folio} className="flex items-center justify-between gap-4 rounded-lg border-2 border-forest bg-white p-4">
                <div>
                  <p className="display text-2xl">{c.services?.nombre}</p>
                  <p className="text-sm font-semibold capitalize text-muted">{fechaHoraLarga(c.inicia_en)} · {c.folio}</p>
                </div>
                <StatusBadge estado={c.estado} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
