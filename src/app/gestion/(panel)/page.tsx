import Link from "next/link";
import CitaGestion, { CITA_SELECT, type CitaFila } from "@/components/CitaGestion";
import { requireOwner } from "@/lib/auth";
import { hoyMX, instante, sumarDias } from "@/lib/disponibilidad";
import { fechaLarga } from "@/lib/format";

export const metadata = { title: "Agenda" };

export default async function AgendaPage() {
  const { supabase } = await requireOwner();
  const hoy = hoyMX();
  const desde = instante(hoy, "00:00").toISOString();
  const hasta = instante(sumarDias(hoy, 8), "00:00").toISOString();
  const [{ data }, { count: pendientes }] = await Promise.all([
    supabase.from("appointments").select(CITA_SELECT).in("estado", ["pending", "confirmed", "quote"]).gte("inicia_en", desde).lt("inicia_en", hasta).order("inicia_en"),
    supabase.from("appointments").select("id", { count: "exact", head: true }).in("estado", ["pending", "quote"]),
  ]);
  const citas = (data ?? []) as unknown as CitaFila[];
  const porDia = new Map<string, CitaFila[]>();
  for (const c of citas) {
    const dia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date(c.inicia_en));
    porDia.set(dia, [...(porDia.get(dia) ?? []), c]);
  }
  const dias = Array.from({ length: 8 }, (_, i) => sumarDias(hoy, i));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.14em]">Panel</p>
          <h1 className="display text-5xl md:text-7xl">Agenda</h1>
        </div>
        <Link href="/gestion/citas/nueva" className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-forest bg-forest px-6 font-bold text-lime shadow-sticker-sm">Nueva cita</Link>
      </div>

      {!!pendientes && (
        <Link href="/gestion/citas?ver=pendientes" className="rounded-lg border-2 border-forest bg-lime p-4 text-lg font-bold shadow-sticker-sm">
          Tienes {pendientes} {pendientes === 1 ? "cita por confirmar" : "citas por confirmar"} →
        </Link>
      )}

      {dias.map((d) => {
        const lista = porDia.get(d) ?? [];
        return (
          <section key={d}>
            <h2 className="display mb-3 text-3xl capitalize">{d === hoy ? "Hoy · " : ""}{fechaLarga(d)}</h2>
            {lista.length === 0 ? (
              <p className="rounded-md border-[1.5px] border-dashed border-forest px-4 py-3 font-semibold text-muted">Sin citas.</p>
            ) : (
              <ul className="flex flex-col gap-3">{lista.map((c) => <CitaGestion key={c.folio} c={c} />)}</ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
