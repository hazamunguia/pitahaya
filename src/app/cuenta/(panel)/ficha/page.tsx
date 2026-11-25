import { requireClient } from "@/lib/auth";
import { fechaCorta } from "@/lib/format";

export const metadata = { title: "Mi ficha de belleza" };
export const instant = false;

const DEDOS = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];
type Medida = { mano: "L" | "R"; dedo: number; medida_mm: number };

export default async function FichaPage() {
  const { supabase, perfil } = await requireClient();
  const [{ data: ficha }, { data: medidas }, { data: hechas }] = await Promise.all([
    supabase.from("beauty_profiles").select("forma, largo, notas, skin_tones(nombre, hex, subtono, id)").eq("client_id", perfil.id).maybeSingle(),
    supabase.from("nail_measurements").select("mano, dedo, medida_mm").eq("client_id", perfil.id).order("dedo"),
    supabase.from("appointments").select("folio, inicia_en, services(nombre), designs(nombre)").eq("estado", "done").order("inicia_en", { ascending: false }).limit(20),
  ]);
  const tono = ficha?.skin_tones as unknown as { id: string; nombre: string; hex: string; subtono: string } | null;
  const { data: colores } = tono
    ? await supabase.from("tone_colors").select("nombre, hex").eq("tone_id", tono.id).order("orden")
    : { data: [] as { nombre: string; hex: string }[] };
  const ms = (medidas ?? []) as Medida[];
  const historial = (hechas ?? []) as unknown as { folio: string; inicia_en: string; services: { nombre: string } | null; designs: { nombre: string } | null }[];

  return (
    <div className="flex flex-col gap-8">
      <p className="font-semibold text-muted">Tu ficha la llena Karina en tu cita. Aquí puedes consultarla cuando quieras.</p>

      {!ficha && ms.length === 0 ? (
        <p className="rounded-lg border-2 border-dashed border-forest bg-white p-6 font-semibold text-muted">Todavía no tienes ficha. Karina la crea en tu primera visita.</p>
      ) : (
        <>
          <section className="rounded-lg border-[2.5px] border-forest bg-white p-6 shadow-sticker-sm">
            <h2 className="display text-3xl">Tu tono</h2>
            {tono ? (
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="size-14 rounded-full border-2 border-forest" style={{ background: tono.hex }} />
                  <div><p className="text-lg font-bold">{tono.nombre}</p><p className="text-sm font-semibold capitalize text-muted">Subtono {tono.subtono}</p></div>
                </div>
                {!!colores?.length && (
                  <div>
                    <p className="mb-2 text-sm font-extrabold uppercase tracking-wider text-muted">Colores que te favorecen</p>
                    <ul className="flex flex-wrap gap-3">
                      {colores.map((c) => (
                        <li key={c.nombre} className="flex items-center gap-2 rounded-full border-[1.5px] border-forest bg-cream py-1.5 pl-1.5 pr-4 text-sm font-bold">
                          <span className="size-7 rounded-full border border-forest" style={{ background: c.hex }} />{c.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : <p className="mt-3 font-semibold text-muted">Sin tono registrado.</p>}
            {(ficha?.forma || ficha?.largo) && (
              <p className="mt-5 font-semibold">{ficha?.forma && <>Forma: <b>{ficha.forma}</b> </>}{ficha?.largo && <>· Largo: <b>{ficha.largo}</b></>}</p>
            )}
            {ficha?.notas && <p className="mt-3 rounded-md bg-cream p-4 font-medium">{ficha.notas}</p>}
          </section>

          {ms.length > 0 && (
            <section className="rounded-lg border-[2.5px] border-forest bg-white p-6 shadow-sticker-sm">
              <h2 className="display text-3xl">Medidas de tus uñas</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                {(["L", "R"] as const).map((mano) => (
                  <div key={mano}>
                    <p className="mb-2 text-sm font-extrabold uppercase tracking-wider text-muted">{mano === "L" ? "Mano izquierda" : "Mano derecha"}</p>
                    <ul className="divide-y divide-forest/15">
                      {DEDOS.map((nombre, i) => {
                        const m = ms.find((x) => x.mano === mano && x.dedo === i + 1);
                        return (
                          <li key={nombre} className="flex justify-between py-2 font-semibold"><span>{nombre}</span><span className="font-bold">{m ? `${m.medida_mm} mm` : "—"}</span></li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {historial.length > 0 && (
        <section>
          <h2 className="display text-3xl">Mis diseños</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {historial.map((h) => (
              <li key={h.folio} className="flex justify-between gap-3 rounded-md border-[1.5px] border-forest bg-white px-4 py-3 font-semibold">
                <span>{h.services?.nombre}{h.designs ? ` · ${h.designs.nombre}` : ""}</span>
                <span className="text-muted">{fechaCorta(h.inicia_en)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
