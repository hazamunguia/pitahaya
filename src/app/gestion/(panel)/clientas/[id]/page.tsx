import Link from "next/link";
import { notFound } from "next/navigation";
import OwnerForm from "@/components/OwnerForm";
import StatusBadge from "@/components/StatusBadge";
import TempPassword from "@/components/TempPassword";
import { cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { fechaHoraLarga, money } from "@/lib/format";
import { visitasRealizadas } from "@/lib/lealtad";
import { waLink } from "@/lib/studio";
import { guardarFicha } from "../../actions";

export const metadata = { title: "Clienta" };

const DEDOS = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];

export default async function ClientaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireOwner();
  const { data: clienta } = await supabase.from("profiles").select("id, nombre, celular, role").eq("id", id).maybeSingle();
  if (!clienta) notFound();

  const [{ data: ficha }, { data: medidas }, { data: tonos }, { data: citas }, visitas] = await Promise.all([
    supabase.from("beauty_profiles").select("tone_id, forma, largo, notas").eq("client_id", id).maybeSingle(),
    supabase.from("nail_measurements").select("mano, dedo, medida_mm").eq("client_id", id),
    supabase.from("skin_tones").select("id, nombre").order("orden"),
    supabase.from("appointments").select("folio, inicia_en, estado, total, services(nombre), designs(nombre)").eq("client_id", id).order("inicia_en", { ascending: false }).limit(20),
    visitasRealizadas(id),
  ]);
  const med = (mano: string, dedo: number) => medidas?.find((m) => m.mano === mano && m.dedo === dedo)?.medida_mm ?? "";
  const lista = (citas ?? []) as unknown as { folio: string; inicia_en: string; estado: string; total: number; services: { nombre: string } | null; designs: { nombre: string } | null }[];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/gestion/clientas" className="font-bold underline">← Clientas</Link>
      <div>
        <h1 className="display text-5xl md:text-7xl">{clienta.nombre || "Sin nombre"}</h1>
        <p className="mt-1 text-lg font-semibold text-muted">{clienta.celular} · {visitas} {visitas === 1 ? "visita realizada" : "visitas realizadas"}</p>
        <a href={waLink(clienta.celular)} className="mt-3 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-forest bg-lime px-5 text-sm font-bold">Escribir por WhatsApp</a>
      </div>

      <section className={cardCls}>
        <h2 className="display text-3xl">Ficha de belleza</h2>
        <p className="mb-4 mt-1 text-sm font-semibold text-muted">La clienta la ve en su cuenta (solo lectura).</p>
        <OwnerForm action={guardarFicha} label="Guardar ficha" key={JSON.stringify([ficha, medidas])}>
          <input type="hidden" name="client_id" value={id} />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className={labelCls}>Tono de piel
              <select name="tone_id" defaultValue={ficha?.tone_id ?? ""} className={inputCls}>
                <option value="">Sin definir</option>
                {tonos?.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </label>
            <label className={labelCls}>Forma<input name="forma" defaultValue={ficha?.forma ?? ""} placeholder="Almendra, cuadrada…" className={inputCls} /></label>
            <label className={labelCls}>Largo<input name="largo" defaultValue={ficha?.largo ?? ""} placeholder="Corto, medio, largo" className={inputCls} /></label>
          </div>
          <label className={labelCls}>Notas<textarea name="notas" rows={3} defaultValue={ficha?.notas ?? ""} className={inputCls} /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            {(["L", "R"] as const).map((mano) => (
              <fieldset key={mano} className="rounded-md border-[1.5px] border-forest p-3">
                <legend className="px-1 text-xs font-extrabold uppercase tracking-wider">{mano === "L" ? "Mano izquierda (mm)" : "Mano derecha (mm)"}</legend>
                <div className="grid grid-cols-5 gap-2">
                  {DEDOS.map((nombre, i) => (
                    <label key={nombre} className="flex flex-col gap-1 text-[11px] font-bold">{nombre}
                      <input name={`m_${mano}_${i + 1}`} type="number" step="0.5" min="0" defaultValue={med(mano, i + 1)} className="min-h-11 w-full rounded-md border-[1.5px] border-forest px-2 text-base" />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </OwnerForm>
      </section>

      <section className={cardCls}>
        <h2 className="display text-3xl">Acceso</h2>
        <p className="mb-4 mt-1 text-sm font-semibold text-muted">Si olvidó su contraseña, genera una temporal y mándasela por WhatsApp.</p>
        <TempPassword clientId={id} nombre={clienta.nombre || "clienta"} whatsapp={waLink(clienta.celular)} />
      </section>

      <section>
        <h2 className="display mb-3 text-3xl">Citas</h2>
        {lista.length === 0 ? <p className="font-semibold text-muted">Sin citas.</p> : (
          <ul className="flex flex-col gap-2">
            {lista.map((c) => (
              <li key={c.folio} className="flex items-center justify-between gap-3 rounded-md border-[1.5px] border-forest bg-white px-4 py-3">
                <div>
                  <p className="font-bold">{c.services?.nombre}{c.designs ? ` · ${c.designs.nombre}` : ""}</p>
                  <p className="text-sm font-semibold capitalize text-muted">{fechaHoraLarga(c.inicia_en)} · {c.folio} · {money(c.total)}</p>
                </div>
                <StatusBadge estado={c.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
