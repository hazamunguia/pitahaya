import { notFound } from "next/navigation";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { createClient } from "@/lib/supabase/server";
import { getStudioInfo } from "@/lib/studio";

export const metadata = { title: "Cita agendada" };
export const instant = false;

const money = (n: number) => `$${Number(n).toLocaleString("es-MX")}`;
const TZ = "America/Mexico_City";

type Cita = {
  folio: string; inicia_en: string; termina_en: string; total: number; precio_diseno: number; estado: string;
  services: { nombre: string } | null; designs: { nombre: string } | null;
  appointment_courtesies: { courtesies: { nombre: string } | null }[];
};

export default async function ConfirmacionPage({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const supabase = await createClient();
  const [{ data }, { data: perfil }] = await Promise.all([
    supabase.from("appointments").select("folio, inicia_en, termina_en, total, precio_diseno, estado, services(nombre), designs(nombre), appointment_courtesies(courtesies(nombre))").eq("folio", folio).maybeSingle(),
    supabase.from("profiles").select("nombre").maybeSingle(),
  ]);
  const cita = data as unknown as Cita | null;
  const studio = await getStudioInfo();
  if (!cita) notFound();

  const inicio = new Date(cita.inicia_en);
  const dia = inicio.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const hora = inicio.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ });
  const minutos = Math.round((Date.parse(cita.termina_en) - inicio.getTime()) / 60000);
  const cortesias = cita.appointment_courtesies.map((c) => c.courtesies?.nombre).filter(Boolean).join(" y ");

  const filas: [string, string][] = [
    ["Folio", cita.folio],
    ["Día", dia],
    ["Hora", hora],
    ["Servicio", `${cita.services?.nombre ?? ""} · ${minutos} min`],
    ["Diseño", cita.designs ? `${cita.designs.nombre}${Number(cita.precio_diseno) ? ` (+${money(cita.precio_diseno)})` : ""}` : "Sin diseño"],
    ["Cortesía", cortesias || "—"],
    ...(studio.direccion ? ([["Estudio", `${studio.direccion}${studio.ciudad ? `, ${studio.ciudad}` : ""}`]] as [string, string][]) : []),
  ];

  return (
    <>
      <Nav />
      <main className="bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-16 pt-10 md:px-10 md:pt-14">
          <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col gap-5 rounded-xl border-[2.5px] border-forest bg-lime p-7 shadow-sticker md:p-10">
              <span className="self-start rounded-full border-[1.5px] border-forest bg-white px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest">Cita agendada</span>
              <h1 className="display text-6xl md:text-8xl">¡Listo, {(perfil?.nombre ?? "").split(" ")[0] || "bienvenida"}!</h1>
              <p className="max-w-lg text-lg font-semibold">Tu cita quedó registrada para el {dia} a las {hora}. Karina la revisa y te la confirma.</p>
            </div>
            <div className="rounded-lg border-[2.5px] border-forest bg-white p-6 shadow-sticker md:p-7">
              <h2 className="display text-3xl">Detalle de tu cita</h2>
              <dl className="mt-3 divide-y divide-forest/15 text-[15px]">
                {filas.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="font-bold text-muted">{k}</dt>
                    <dd className="text-right font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex items-baseline justify-between border-t-2 border-forest pt-4">
                <span className="text-sm font-extrabold tracking-widest">TOTAL</span>
                <span className="display text-4xl text-magenta-deep">{money(cita.total)}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/cuenta/citas" arrow>Ver mis citas</Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-forest bg-blush p-7">
            <p className="text-xs font-extrabold uppercase tracking-[.14em]">Qué sigue</p>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {["Karina revisa tu cita y te la confirma.", "Verás tu cita y su estado en tu cuenta.", "Llega unos minutos antes. Te esperamos con tu cortesía."].map((t, i) => (
                <div key={t} className="flex gap-3">
                  <span className="display text-4xl leading-none text-magenta">{i + 1}</span>
                  <span className="font-semibold leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
