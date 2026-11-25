"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";

export type Tab = { href: string; label: string; exact?: boolean; destacada?: boolean };

function Cargando() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`ml-2 size-3 shrink-0 rounded-full border-2 border-current border-t-transparent ${pending ? "animate-spin" : "hidden"}`}
    />
  );
}

/** Menú por pestañas: se ajusta a varias filas (sin scroll horizontal), marca la activa y muestra un giro al tocar. */
export default function TabsNav({ tabs, etiqueta, claro = false }: { tabs: Tab[]; etiqueta: string; claro?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label={etiqueta}>
      <ul className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const activa = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/");
          const base = "inline-flex min-h-11 touch-manipulation items-center rounded-full border-[1.5px] border-forest px-4 text-sm font-bold transition-colors active:scale-[.97]";
          const color = activa
            ? "bg-forest text-lime"
            : t.destacada
              ? "bg-forest text-lime"
              : `${claro ? "bg-white" : "bg-cream"} hover:bg-lime`;
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={activa ? "page" : undefined} className={`${base} ${color}`}>
                {t.label}
                <Cargando />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
