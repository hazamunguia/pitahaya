import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import TabsNav, { type Tab } from "@/components/TabsNav";
import { salir } from "@/app/cuenta/acceso/actions";

export const instant = false;
export const metadata: Metadata = {
  title: { default: "Panel · PITAHAYA", template: "%s · Panel PITAHAYA" },
  manifest: "/pwa/manifest-admin.webmanifest",
  robots: { index: false, follow: false },
};

const tabs: Tab[] = [
  { href: "/gestion", label: "Agenda", exact: true },
  { href: "/gestion/citas", label: "Citas" },
  { href: "/gestion/clientas", label: "Clientas" },
  { href: "/gestion/servicios", label: "Servicios" },
  { href: "/gestion/disenos", label: "Diseños" },
  { href: "/gestion/cortesias", label: "Cortesías" },
  { href: "/gestion/horario", label: "Horario" },
  { href: "/gestion/ajustes", label: "Ajustes" },
];

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const { perfil } = await requireOwner();
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b-2 border-forest bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link href="/gestion" aria-label="Panel PITAHAYA"><Image src="/brand/logo/pitahaya-logo-horizontal-forest.svg" alt="PITAHAYA" width={150} height={36} className="h-8 w-auto" priority /></Link>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="hidden sm:inline">{perfil.nombre.split(" ")[0]}</span>
            <Link href="/" className="underline">Ver sitio</Link>
            <form action={salir}><button className="rounded-full border-[1.5px] border-forest px-4 py-1.5">Salir</button></form>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-3 md:px-8"><TabsNav tabs={tabs} etiqueta="Panel" /></div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
