import Image from "next/image";
import Link from "next/link";
import Button from "./Button";
import Icon from "./Icon";

export const NAV_LINKS = [
  { n: "Servicios", h: "/#servicios" },
  { n: "Diseños", h: "/#disenos" },
  { n: "Cortesías", h: "/#cortesias" },
  { n: "Cómo agendar", h: "/#como" },
];

export function Announce() {
  const items = ["Agenda en línea las 24 h", "Cortesía en cada cita", "Diseños a tu medida"];
  return (
    <div className="flex justify-center gap-6 overflow-hidden whitespace-nowrap bg-forest py-2.5 text-xs font-extrabold uppercase tracking-[.14em] text-lime">
      {items.map((t, i) => (
        <span key={t} className={`items-center gap-4 ${i === 0 ? "inline-flex" : "hidden sm:inline-flex"}`}>
          <Icon name="sparkles" size={14} /> {t}
        </span>
      ))}
    </div>
  );
}

export default function Nav() {
  return (
    <header className="border-b-2 border-forest bg-cream">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-[84px] md:px-10">
        <Link href="/" aria-label="PITAHAYA, inicio">
          <Image src="/brand/logo/pitahaya-logo-horizontal-forest.svg" alt="PITAHAYA Beauty Studio" width={190} height={46} priority className="h-9 w-auto md:h-11" />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.n} href={l.h} className="text-sm font-bold uppercase tracking-[.08em] hover:underline">
              {l.n}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/cuenta/acceso" className="hidden items-center gap-2 text-sm font-bold md:flex">
            <Icon name="user" size={18} /> Mi cuenta
          </Link>
          <Button href="/reservar" size="md" arrow className="hidden sm:inline-flex">Agendar cita</Button>
          <details className="relative md:hidden">
            <summary aria-label="Abrir menú" className="grid size-11 cursor-pointer list-none place-items-center rounded-full border-[1.5px] border-forest bg-white [&::-webkit-details-marker]:hidden">
              <Icon name="menu" size={22} />
            </summary>
            <div className="absolute right-0 top-14 z-30 flex w-64 flex-col gap-1 rounded-lg border-2 border-forest bg-white p-3 shadow-sticker">
              {NAV_LINKS.map((l) => (
                <Link key={l.n} href={l.h} className="rounded-md px-3 py-3 font-bold hover:bg-cream">{l.n}</Link>
              ))}
              <Link href="/cuenta/acceso" className="rounded-md px-3 py-3 font-bold hover:bg-cream">Mi cuenta</Link>
              <Button href="/reservar" arrow className="mt-1">Agendar cita</Button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
