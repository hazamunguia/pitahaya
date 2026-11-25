import { notFound, redirect } from "next/navigation";
import ReagendarForm from "@/components/ReagendarForm";
import { requireClient } from "@/lib/auth";
import { getOpenDays } from "@/lib/catalog";
import { hoyMX, MAX_DIAS, sumarDias } from "@/lib/disponibilidad";
import { fechaHoraLarga } from "@/lib/format";

export const metadata = { title: "Reagendar cita" };
export const instant = false;

export default async function ReagendarPage({ params }: { params: Promise<{ folio: string }> }) {
  const { folio } = await params;
  const { supabase } = await requireClient();
  const { data } = await supabase.from("appointments").select("folio, inicia_en, estado, services(nombre)").eq("folio", folio).maybeSingle();
  if (!data) notFound();
  if (!["pending", "confirmed", "quote"].includes(data.estado)) redirect("/cuenta/citas");
  const servicio = data.services as unknown as { nombre: string } | null;
  const [diasAbiertos, hoy] = [await getOpenDays(), hoyMX()];

  return (
    <div className="flex flex-col gap-5">
      <h2 className="display text-4xl md:text-5xl">Reagendar cita</h2>
      <p className="font-semibold text-muted">
        {servicio?.nombre} · ahora el <span className="capitalize">{fechaHoraLarga(data.inicia_en)}</span>. Elige el nuevo día y hora.
      </p>
      <ReagendarForm folio={data.folio} hoy={hoy} maxFecha={sumarDias(hoy, MAX_DIAS)} diasAbiertos={diasAbiertos} />
    </div>
  );
}
