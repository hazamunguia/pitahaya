import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/auth";

export const instant = false;

const tabs = [
  ["/cuenta/citas", "Mis citas"],
  ["/cuenta/ficha", "Mi ficha"],
  ["/cuenta/charms", "Mis charms"],
  ["/cuenta/perfil", "Mi perfil"],
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { perfil } = await requireUser();
  return (
    <>
      <Nav />
      <main className="min-h-[70vh] bg-cream">
        <div className="mx-auto max-w-4xl px-5 pb-16 pt-8 md:px-10 md:pt-12">
          <p className="text-xs font-extrabold uppercase tracking-[.14em]">Mi cuenta</p>
          <h1 className="display mt-2 text-5xl md:text-7xl">Hola, {perfil.nombre.split(" ")[0] || "bienvenida"}</h1>
          <nav aria-label="Mi cuenta" className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([href, label]) => (
              <Link key={href} href={href} className="shrink-0 rounded-full border-[1.5px] border-forest bg-white px-5 py-2.5 text-sm font-bold hover:bg-lime">
                {label}
              </Link>
            ))}
            {perfil.role === "owner" && (
              <Link href="/gestion" className="shrink-0 rounded-full border-[1.5px] border-forest bg-forest px-5 py-2.5 text-sm font-bold text-lime">Panel de gestión</Link>
            )}
          </nav>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
