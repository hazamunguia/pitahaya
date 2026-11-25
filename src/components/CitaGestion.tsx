import Link from "next/link";
import StatusBadge from "./StatusBadge";
import { fechaHoraLarga, money } from "@/lib/format";
import { waLink } from "@/lib/studio";
import { cambiarEstado } from "@/app/gestion/(panel)/actions";

export type CitaFila = {
  folio: string; inicia_en: string; termina_en: string; estado: string; total: number; descuento_pct: number; nota_clienta: string | null; nota_interna: string | null; origen: string;
  client_id: string;
  profiles: { nombre: string; celular: string } | null;
  services: { nombre: string } | null;
  designs: { nombre: string } | null;
  appointment_courtesies: { courtesies: { nombre: string } | null }[];
};

export const CITA_SELECT = "folio, inicia_en, termina_en, estado, total, descuento_pct, nota_clienta, nota_interna, origen, client_id, profiles(nombre, celular), services(nombre), designs(nombre), appointment_courtesies(courtesies(nombre))";

function Accion({ folio, estado, label, tono }: { folio: string; estado: string; label: string; tono: "ok" | "neutro" | "peligro" }) {
  const cls = tono === "ok" ? "bg-forest text-lime" : tono === "peligro" ? "bg-white text-danger-text" : "bg-white";
  return (
    <form action={cambiarEstado}>
      <input type="hidden" name="folio" value={folio} />
      <input type="hidden" name="estado" value={estado} />
      <button className={`min-h-11 rounded-full border-[1.5px] border-forest px-5 text-sm font-bold ${cls}`}>{label}</button>
    </form>
  );
}

export default function CitaGestion({ c }: { c: CitaFila }) {
  const cortesias = c.appointment_courtesies.map((x) => x.courtesies?.nombre).filter(Boolean).join(" y ");
  const minutos = Math.round((Date.parse(c.termina_en) - Date.parse(c.inicia_en)) / 60000);
  return (
    <li className="rounded-lg border-2 border-forest bg-white p-5 shadow-sticker-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold capitalize">{fechaHoraLarga(c.inicia_en)} · {minutos} min</p>
          <Link href={`/gestion/clientas/${c.client_id}`} className="display mt-1 block text-3xl underline-offset-4 hover:underline">{c.profiles?.nombre || "Sin nombre"}</Link>
          <p className="mt-1 font-semibold">{c.services?.nombre}{c.designs ? ` · ${c.designs.nombre}` : ""}</p>
          <p className="text-sm font-semibold text-muted">{c.folio} · {money(c.total)}{c.descuento_pct ? ` (${c.descuento_pct}% desc.)` : ""}{cortesias ? ` · ${cortesias}` : ""}{c.origen === "manual" ? " · manual" : ""}</p>
        </div>
        <StatusBadge estado={c.estado} />
      </div>
      {c.nota_clienta && <p className="mt-3 rounded-md bg-cream p-3 text-sm font-medium"><b>Nota de la clienta:</b> {c.nota_clienta}</p>}
      {c.nota_interna && <p className="mt-2 rounded-md bg-blush p-3 text-sm font-medium"><b>Nota interna:</b> {c.nota_interna}</p>}
      <div className="mt-4 flex flex-wrap gap-2.5">
        {(c.estado === "pending" || c.estado === "quote") && <Accion folio={c.folio} estado="confirmed" label="Confirmar" tono="ok" />}
        {c.estado === "confirmed" && <Accion folio={c.folio} estado="done" label="Marcar realizada" tono="ok" />}
        {c.estado === "pending" && <Accion folio={c.folio} estado="done" label="Marcar realizada" tono="neutro" />}
        {["pending", "quote", "confirmed"].includes(c.estado) && <Accion folio={c.folio} estado="cancelled" label="Cancelar" tono="peligro" />}
        {c.profiles?.celular && <a href={waLink(c.profiles.celular, `Hola ${c.profiles.nombre.split(" ")[0]}, sobre tu cita ${c.folio} en PITAHAYA…`)} className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-forest bg-lime px-5 text-sm font-bold">WhatsApp</a>}
      </div>
    </li>
  );
}
