import { NombreForm, PasswordForm } from "@/components/PerfilForms";
import PushToggle from "@/components/PushToggle";
import { requireUser } from "@/lib/auth";
import { salir } from "../../acceso/actions";

export const metadata = { title: "Mi perfil" };
export const instant = false;

const seccion = "rounded-lg border-[2.5px] border-forest bg-white p-6 shadow-sticker-sm";

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ cambiar?: string }> }) {
  const { perfil } = await requireUser();
  const { cambiar } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      {(cambiar || perfil.debe_cambiar_password) && (
        <p role="status" className="rounded-md border-[1.5px] border-forest bg-blush px-4 py-3 font-bold">Karina te dio una contraseña temporal. Crea la tuya para continuar.</p>
      )}
      <section className={seccion}>
        <h2 className="display text-3xl">Mis datos</h2>
        <p className="mb-4 mt-1 font-semibold text-muted">Celular: {perfil.celular}</p>
        <NombreForm nombre={perfil.nombre} />
      </section>
      <section className={seccion}>
        <h2 className="display mb-4 text-3xl">Contraseña</h2>
        <PasswordForm />
      </section>
      <section className={seccion}>
        <h2 className="display text-3xl">Avisos en tu celular</h2>
        <p className="mb-4 mt-1 font-semibold text-muted">Te avisamos cuando Karina confirme o cambie tu cita.</p>
        <PushToggle />
      </section>
      <form action={salir}>
        <button className="min-h-12 rounded-full border-[1.5px] border-forest bg-white px-6 font-bold shadow-sticker-sm">Cerrar sesión</button>
      </form>
    </div>
  );
}
