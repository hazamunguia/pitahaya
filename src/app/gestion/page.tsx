import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { salir } from "../cuenta/acceso/actions";

export const instant = false;

export default async function GestionPage() {
  const supabase = await createClient();
  const { data: perfil } = await supabase.from("profiles").select("nombre, role").single();
  if (perfil?.role !== "owner") redirect("/cuenta/citas");

  return (
    <main className="min-h-screen bg-forest px-6 py-16 text-cream">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-extrabold uppercase tracking-widest text-lime">Panel de gestión</p>
        <h1 className="display mt-2 text-6xl sm:text-8xl">Hola, {perfil.nombre.split(" ")[0]}</h1>
        <p className="mt-4 text-lg font-semibold">Aquí estará tu agenda, clientas y cotizaciones.</p>
        <form action={salir} className="mt-8">
          <button className="min-h-12 rounded-full border-[1.5px] border-cream px-6 font-bold">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}
