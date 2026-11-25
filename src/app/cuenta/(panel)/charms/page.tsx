import Icon from "@/components/Icon";
import { requireClient } from "@/lib/auth";
import { numeroDeVisita, pasosLealtad, visitasRealizadas } from "@/lib/lealtad";

export const metadata = { title: "Mis charms" };
export const instant = false;

export default async function CharmsPage() {
  const { perfil } = await requireClient();
  const [pasos, hechas] = await Promise.all([pasosLealtad(), visitasRealizadas(perfil.id)]);
  const siguiente = numeroDeVisita(hechas);
  const enCiclo = hechas === 0 ? 0 : hechas % 10 === 0 ? 10 : hechas % 10;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border-[2.5px] border-forest bg-lime p-6 shadow-sticker">
        <p className="display text-5xl">{hechas} {hechas === 1 ? "visita" : "visitas"}</p>
        <p className="mt-2 font-semibold">{pasos.find((p) => p.visita === siguiente)?.texto ? <>Tu próxima visita te da: <b>{pasos.find((p) => p.visita === siguiente)?.texto}</b></> : "¡Gracias por visitarnos!"}</p>
      </div>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {pasos.map((p) => {
          const logrado = p.visita <= enCiclo;
          const toca = p.visita === siguiente;
          return (
            <li key={p.visita} className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center ${logrado ? "border-forest bg-lime" : toca ? "border-magenta bg-white shadow-[3px_3px_0_var(--color-magenta)]" : "border-forest/40 bg-white"}`}>
              <span className="display text-3xl">{p.visita}</span>
              <Icon name={p.tipo === "desc" ? "tag" : p.tipo === "premio" ? "star" : "sparkles"} size={26} />
              <span className="text-xs font-bold leading-snug">{p.texto}</span>
              {logrado && <Icon name="check" size={18} stroke={3} />}
            </li>
          );
        })}
      </ol>
      <p className="text-sm font-semibold text-muted">Cada visita realizada suma. Los charms y premios se entregan en tu cita. Los descuentos se aplican solos al agendar.</p>
    </div>
  );
}
