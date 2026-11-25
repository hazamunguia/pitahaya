import OwnerForm from "@/components/OwnerForm";
import { inputCls, labelCls, cardCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { hoyMX } from "@/lib/disponibilidad";
import { crearCitaManual } from "../../actions";

export const metadata = { title: "Nueva cita" };

export default async function NuevaCitaPage() {
  const { supabase } = await requireOwner();
  const [{ data: clientas }, { data: servicios }, { data: disenos }] = await Promise.all([
    supabase.from("profiles").select("id, nombre, celular").eq("role", "client").order("nombre"),
    supabase.from("services").select("id, nombre, precio_base").eq("visible", true).order("orden"),
    supabase.from("designs").select("id, nombre, precio_extra").eq("visible", true).order("orden"),
  ]);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Nueva cita</h1>
      <p className="font-semibold text-muted">Para clientas que te escriben por WhatsApp o llegan directo. La cita queda confirmada. Si la clienta aún no tiene cuenta, pídele que cree la suya primero.</p>
      <div className={cardCls}>
        <OwnerForm action={crearCitaManual} label="Crear cita">
          <label className={labelCls}>Clienta
            <select name="client_id" required className={inputCls} defaultValue="">
              <option value="" disabled>Elige…</option>
              {clientas?.map((c) => <option key={c.id} value={c.id}>{c.nombre || "Sin nombre"} · {c.celular}</option>)}
            </select>
          </label>
          <label className={labelCls}>Servicio
            <select name="service_id" required className={inputCls} defaultValue="">
              <option value="" disabled>Elige…</option>
              {servicios?.map((s) => <option key={s.id} value={s.id}>{s.nombre} · ${s.precio_base}</option>)}
            </select>
          </label>
          <label className={labelCls}>Diseño (opcional)
            <select name="design_id" className={inputCls} defaultValue="">
              <option value="">Sin diseño</option>
              {disenos?.map((d) => <option key={d.id} value={d.id}>{d.nombre} · +${d.precio_extra}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelCls}>Día<input type="date" name="fecha" required min={hoyMX()} className={inputCls} /></label>
            <label className={labelCls}>Hora<input type="time" name="hora" required step={900} className={inputCls} /></label>
          </div>
          <label className={labelCls}>Descuento % (opcional)<input type="number" name="descuento_pct" min={0} max={100} defaultValue={0} className={inputCls} /></label>
          <label className={labelCls}>Nota interna (opcional)<textarea name="nota" rows={2} className={inputCls} /></label>
        </OwnerForm>
      </div>
    </div>
  );
}
