import ReservaFlow from "@/components/ReservaFlow";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { getCourtesies, getDesigns, getOpenDays, getServices } from "@/lib/catalog";
import { hoyMX, MAX_DIAS, sumarDias } from "@/lib/disponibilidad";
import { requireUser } from "@/lib/auth";
import { pasoSiguiente } from "@/lib/lealtad";

export const metadata = { title: "Agenda tu cita" };
export const instant = false;

export default async function ReservarPage() {
  const { perfil } = await requireUser();
  const [sig, servicios, disenos, cortesias, diasAbiertos] = await Promise.all([
    pasoSiguiente(perfil.id),
    getServices(),
    getDesigns(),
    getCourtesies(),
    getOpenDays(),
  ]);
  const hoy = hoyMX();
  return (
    <>
      <Nav />
      <main className="bg-cream">
        <ReservaFlow nombre={perfil.nombre}
          lealtad={sig.paso ? { visita: sig.visita, texto: sig.paso.texto, descuento_pct: sig.paso.tipo === "desc" ? Number(sig.paso.descuento_pct ?? 0) : 0 } : null} hoy={hoy} maxFecha={sumarDias(hoy, MAX_DIAS)} diasAbiertos={diasAbiertos} servicios={servicios} disenos={disenos} cortesias={cortesias} />
      </main>
      <Footer />
    </>
  );
}
