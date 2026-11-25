import OwnerForm from "@/components/OwnerForm";
import { cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { guardarCortesia } from "../actions";

export const metadata = { title: "Cortesías" };

type C = { id: string; nombre: string; icono: string | null; disponible: boolean; orden: number };
const ICONOS: [string, string][] = [["coffee", "Taza"], ["glass", "Vaso"], ["leaf", "Hoja"], ["cheers", "Brindis"], ["sparkles", "Destello"], ["heart", "Corazón"], ["star", "Estrella"]];

function Campos({ c }: { c?: C }) {
  return (
    <>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_.7fr]">
        <label className={labelCls}>Nombre<input name="nombre" required defaultValue={c?.nombre} className={inputCls} /></label>
        <label className={labelCls}>Ícono
          <select name="icono" defaultValue={c?.icono ?? "sparkles"} className={inputCls}>{ICONOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className={labelCls}>Orden<input name="orden" type="number" defaultValue={c?.orden ?? 0} className={inputCls} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="disponible" defaultChecked={c?.disponible ?? true} className="size-5 accent-forest" /> Disponible</label>
    </>
  );
}

export default async function CortesiasPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("courtesies").select("id, nombre, icono, disponible, orden").order("orden");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Cortesías</h1>
      <p className="font-semibold text-muted">Lo que la clienta puede elegir al agendar (hasta 2 por cita).</p>
      <ul className="flex flex-col gap-4">
        {(data as C[] | null)?.map((c) => (
          <li key={c.id} className={cardCls}><OwnerForm action={guardarCortesia} key={JSON.stringify(c)}><Campos c={c} /></OwnerForm></li>
        ))}
      </ul>
      <section className={`${cardCls} bg-cream`}>
        <h2 className="display mb-4 text-3xl">Agregar cortesía</h2>
        <OwnerForm action={guardarCortesia} label="Agregar"><Campos /></OwnerForm>
      </section>
    </div>
  );
}
