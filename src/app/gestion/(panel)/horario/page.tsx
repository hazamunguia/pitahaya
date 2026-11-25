import OwnerForm from "@/components/OwnerForm";
import { btnLightCls, cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { hoyMX } from "@/lib/disponibilidad";
import { fechaHoraLarga } from "@/lib/format";
import { agregarBloqueo, eliminarBloqueo, guardarHorario } from "../actions";

export const metadata = { title: "Horario" };

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDEN = [1, 2, 3, 4, 5, 6, 0];

export default async function HorarioPage() {
  const { supabase } = await requireOwner();
  const [{ data: reglas }, { data: bloqueos }] = await Promise.all([
    supabase.from("availability_rules").select("dia_semana, abierto, desde, hasta"),
    supabase.from("blocked_slots").select("id, inicia_en, termina_en, motivo, repite_semanal").gte("termina_en", new Date().toISOString()).order("inicia_en"),
  ]);
  const regla = (d: number) => reglas?.find((r) => r.dia_semana === d);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Horario</h1>

      <section className={cardCls} aria-labelledby="h-sem">
        <h2 id="h-sem" className="display mb-4 text-3xl">Horario semanal</h2>
        <OwnerForm action={guardarHorario} label="Guardar horario" key={JSON.stringify(reglas)}>
          <div className="flex flex-col gap-3">
            {ORDEN.map((d) => {
              const r = regla(d);
              return (
                <div key={d} className="grid grid-cols-[1fr_auto] items-center gap-3 sm:grid-cols-[9rem_auto_1fr_1fr]">
                  <span className="font-bold">{DIAS[d]}</span>
                  <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name={`abierto_${d}`} defaultChecked={r?.abierto ?? false} className="size-5 accent-forest" /> Abierto</label>
                  <input type="time" name={`desde_${d}`} defaultValue={String(r?.desde ?? "10:00").slice(0, 5)} aria-label={`${DIAS[d]} abre`} className={inputCls} />
                  <input type="time" name={`hasta_${d}`} defaultValue={String(r?.hasta ?? "18:00").slice(0, 5)} aria-label={`${DIAS[d]} cierra`} className={inputCls} />
                </div>
              );
            })}
          </div>
        </OwnerForm>
      </section>

      <section className={cardCls} aria-labelledby="h-blq">
        <h2 id="h-blq" className="display text-3xl">Días y horas bloqueados</h2>
        <p className="mb-4 mt-1 text-sm font-semibold text-muted">Vacaciones, comida, trámites… Esas horas no se pueden reservar.</p>
        <OwnerForm action={agregarBloqueo} label="Bloquear">
          <div className="grid gap-3 sm:grid-cols-4">
            <label className={labelCls}>Día<input type="date" name="fecha" required min={hoyMX()} className={inputCls} /></label>
            <label className={labelCls}>Desde<input type="time" name="desde" defaultValue="10:00" className={inputCls} /></label>
            <label className={labelCls}>Hasta<input type="time" name="hasta" defaultValue="18:00" className={inputCls} /></label>
            <label className={labelCls}>Motivo<input name="motivo" className={inputCls} placeholder="Opcional" /></label>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-bold">
            <label className="flex items-center gap-2"><input type="checkbox" name="todo_el_dia" className="size-5 accent-forest" /> Todo el día</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="repite_semanal" className="size-5 accent-forest" /> Se repite cada semana</label>
          </div>
        </OwnerForm>
        <ul className="mt-5 flex flex-col gap-2">
          {bloqueos?.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-md border-[1.5px] border-forest bg-cream px-4 py-3">
              <span className="text-sm font-semibold"><span className="capitalize">{fechaHoraLarga(b.inicia_en)}</span> → {new Date(b.termina_en).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" })}{b.repite_semanal ? " · cada semana" : ""}{b.motivo ? ` · ${b.motivo}` : ""}</span>
              <form action={eliminarBloqueo}><input type="hidden" name="id" value={b.id} /><button className={btnLightCls}>Quitar</button></form>
            </li>
          ))}
          {!bloqueos?.length && <li className="text-sm font-semibold text-muted">No hay bloqueos.</li>}
        </ul>
      </section>
    </div>
  );
}
