"use client";

import { useActionState } from "react";
import { actualizarNombre, cambiarPassword, type FormState } from "@/app/cuenta/(panel)/actions";

const input = "min-h-12 w-full rounded-md border-[1.5px] border-forest bg-white px-4 text-base font-medium focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-magenta";
const boton = "min-h-12 self-start rounded-full border-[1.5px] border-forest bg-forest px-6 font-bold text-lime shadow-sticker-sm disabled:opacity-60";
const ini: FormState = {};

function Mensaje({ s }: { s: FormState }) {
  if (s.error) return <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger-text">{s.error}</p>;
  if (s.ok) return <p role="status" className="rounded-md bg-lime px-4 py-3 text-sm font-bold">{s.ok}</p>;
  return null;
}

export function NombreForm({ nombre }: { nombre: string }) {
  const [s, action, pending] = useActionState(actualizarNombre, ini);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-bold">Nombre
        <input name="nombre" defaultValue={nombre} required autoComplete="name" className={input} />
      </label>
      <Mensaje s={s} />
      <button disabled={pending} className={boton}>{pending ? "Guardando…" : "Guardar nombre"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [s, action, pending] = useActionState(cambiarPassword, ini);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-bold">Nueva contraseña
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className={input} placeholder="Mínimo 8 caracteres" />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">Repite la contraseña
        <input name="confirm" type="password" minLength={8} required autoComplete="new-password" className={input} />
      </label>
      <Mensaje s={s} />
      <button disabled={pending} className={boton}>{pending ? "Guardando…" : "Cambiar contraseña"}</button>
    </form>
  );
}
