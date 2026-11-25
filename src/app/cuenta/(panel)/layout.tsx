import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import Nav from "@/components/Nav";
import TabsNav, { type Tab } from "@/components/TabsNav";
import { requireUser } from "@/lib/auth";

export const instant = false;

const tabs: Tab[] = [
  { href: "/cuenta/citas", label: "Mis citas" },
  { href: "/cuenta/ficha", label: "Mi ficha" },
  { href: "/cuenta/charms", label: "Mis charms" },
  { href: "/cuenta/perfil", label: "Mi perfil" },
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
          <div className="mt-6">
            <TabsNav claro etiqueta="Mi cuenta" tabs={perfil.role === "owner" ? [...tabs, { href: "/gestion", label: "Panel de gestión", destacada: true }] : tabs} />
          </div>
          <InstallPrompt />
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
