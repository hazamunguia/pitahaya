import OwnerForm from "@/components/OwnerForm";
import { cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { guardarDiseno } from "../actions";

export const metadata = { title: "Diseños" };

type D = { id: string; nombre: string; precio_extra: number; minutos_extra: number; visible: boolean; orden: number };

function Campos({ d }: { d?: D }) {
  return (
    <>
      {d && <input type="hidden" name="id" value={d.id} />}
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_.7fr]">
        <label className={labelCls}>Nombre<input name="nombre" required defaultValue={d?.nombre} className={inputCls} /></label>
        <label className={labelCls}>Costo extra ($)<input name="precio_extra" type="number" min="0" step="1" defaultValue={d?.precio_extra ?? 0} className={inputCls} /></label>
        <label className={labelCls}>Minutos extra<input name="minutos_extra" type="number" min="0" step="5" defaultValue={d?.minutos_extra ?? 0} className={inputCls} /></label>
        <label className={labelCls}>Orden<input name="orden" type="number" defaultValue={d?.orden ?? 0} className={inputCls} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="visible" defaultChecked={d?.visible ?? true} className="size-5 accent-forest" /> Visible para reservar</label>
    </>
  );
}

export default async function DisenosPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("designs").select("id, nombre, precio_extra, minutos_extra, visible, orden").order("orden");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Diseños</h1>
      <p className="font-semibold text-muted">Los diseños de la casa que la clienta puede elegir. Los minutos extra alargan la cita.</p>
      <ul className="flex flex-col gap-4">
        {(data as D[] | null)?.map((d) => (
          <li key={d.id} className={cardCls}><OwnerForm action={guardarDiseno} key={JSON.stringify(d)}><Campos d={d} /></OwnerForm></li>
        ))}
      </ul>
      <section className={`${cardCls} bg-cream`}>
        <h2 className="display mb-4 text-3xl">Agregar diseño</h2>
        <OwnerForm action={guardarDiseno} label="Agregar"><Campos /></OwnerForm>
      </section>
    </div>
  );
}
