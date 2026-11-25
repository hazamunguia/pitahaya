import Link from "next/link";
import CitaGestion, { CITA_SELECT, type CitaFila } from "@/components/CitaGestion";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Citas" };

const VISTAS = [["pendientes", "Por confirmar"], ["proximas", "Próximas"], ["historial", "Historial"]] as const;

export default async function CitasPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { supabase } = await requireOwner();
  const { ver = "pendientes" } = await searchParams;
  const ahora = new Date().toISOString();
  let q = supabase.from("appointments").select(CITA_SELECT);
  if (ver === "pendientes") q = q.in("estado", ["pending", "quote"]).order("inicia_en");
  else if (ver === "proximas") q = q.eq("estado", "confirmed").gte("inicia_en", ahora).order("inicia_en");
  else q = q.in("estado", ["done", "cancelled"]).order("inicia_en", { ascending: false }).limit(60);
  const { data } = await q;
  const citas = (data ?? []) as unknown as CitaFila[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Citas</h1>
      <div className="flex flex-wrap gap-2">
        {VISTAS.map(([k, label]) => (
          <Link key={k} href={`/gestion/citas?ver=${k}`} className={`rounded-full border-[1.5px] border-forest px-5 py-2 text-sm font-bold ${ver === k ? "bg-forest text-lime" : "bg-white"}`}>{label}</Link>
        ))}
        <Link href="/gestion/citas/nueva" className="rounded-full border-[1.5px] border-forest bg-lime px-5 py-2 text-sm font-bold">+ Nueva cita</Link>
      </div>
      {citas.length === 0 ? <p className="rounded-lg border-2 border-dashed border-forest bg-white p-6 font-semibold text-muted">No hay citas en esta vista.</p> : <ul className="flex flex-col gap-3">{citas.map((c) => <CitaGestion key={c.folio} c={c} />)}</ul>}
    </div>
  );
}
