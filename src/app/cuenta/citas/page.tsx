import { createClient } from "@/lib/supabase/server";
import { salir } from "../acceso/actions";

export const instant = false;

export default async function MisCitasPage() {
  const supabase = await createClient();
  const { data: perfil } = await supabase.from("profiles").select("nombre, celular, role").single();

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-extrabold uppercase tracking-widest">Mi cuenta</p>
        <h1 className="display mt-2 text-6xl sm:text-8xl">Hola, {perfil?.nombre?.split(" ")[0] || "bienvenida"}</h1>
        <p className="mt-4 text-lg font-semibold text-muted">Celular {perfil?.celular}. Pronto aquí verás tus citas.</p>
        <form action={salir} className="mt-8">
          <button className="min-h-12 rounded-full border-[1.5px] border-forest bg-card px-6 font-bold shadow-sticker-sm">Cerrar sesión</button>
        </form>
      </div>
    </main>
  );
}
