import OwnerForm from "@/components/OwnerForm";
import { cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { guardarServicio } from "../actions";

export const metadata = { title: "Servicios" };

type S = { id: string; nombre: string; descripcion: string | null; duracion_min: number; precio_base: number; admite_diseno: boolean; visible: boolean; orden: number };

function Campos({ s }: { s?: S }) {
  return (
    <>
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_.7fr]">
        <label className={labelCls}>Nombre<input name="nombre" required defaultValue={s?.nombre} className={inputCls} /></label>
        <label className={labelCls}>Precio base ($)<input name="precio_base" type="number" min="0" step="1" required defaultValue={s?.precio_base} className={inputCls} /></label>
        <label className={labelCls}>Duración (min)<input name="duracion_min" type="number" min="15" step="5" required defaultValue={s?.duracion_min ?? 60} className={inputCls} /></label>
        <label className={labelCls}>Orden<input name="orden" type="number" defaultValue={s?.orden ?? 0} className={inputCls} /></label>
      </div>
      <label className={labelCls}>Descripción<input name="descripcion" defaultValue={s?.descripcion ?? ""} className={inputCls} /></label>
      <div className="flex flex-wrap gap-5 text-sm font-bold">
        <label className="flex items-center gap-2"><input type="checkbox" name="admite_diseno" defaultChecked={s?.admite_diseno ?? false} className="size-5 accent-forest" /> Admite diseño</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="visible" defaultChecked={s?.visible ?? true} className="size-5 accent-forest" /> Visible para reservar</label>
      </div>
    </>
  );
}

export default async function ServiciosPage() {
  const { supabase } = await requireOwner();
  const { data } = await supabase.from("services").select("id, nombre, descripcion, duracion_min, precio_base, admite_diseno, visible, orden").order("orden");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Servicios</h1>
      <p className="font-semibold text-muted">Los cambios se ven al momento en el sitio y en las reservas. Para quitar un servicio, desmarca “Visible”.</p>
      <ul className="flex flex-col gap-4">
        {(data as S[] | null)?.map((s) => (
          <li key={s.id} className={cardCls}>
            <OwnerForm action={guardarServicio} key={JSON.stringify(s)}><Campos s={s} /></OwnerForm>
          </li>
        ))}
      </ul>
      <section className={`${cardCls} bg-cream`}>
        <h2 className="display mb-4 text-3xl">Agregar servicio</h2>
        <OwnerForm action={guardarServicio} label="Agregar"><Campos /></OwnerForm>
      </section>
    </div>
  );
}
