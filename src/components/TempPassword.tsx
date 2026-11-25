"use client";

import { useActionState } from "react";
import { contrasenaTemporal, type TempState } from "@/app/gestion/(panel)/actions";
import { btnLightCls } from "./owner-ui";

export default function TempPassword({ clientId, nombre, whatsapp }: { clientId: string; nombre: string; whatsapp: string }) {
  const [s, action, pending] = useActionState(contrasenaTemporal, {} as TempState);
  const texto = s.password
    ? `Hola ${nombre.split(" ")[0]}, tu contraseña temporal de PITAHAYA es: ${s.password}\nEntra en ${window.location.origin}/cuenta/acceso y te pedirá crear la tuya.`
    : "";
  return (
    <div className="flex flex-col gap-3">
      <form action={action}>
        <input type="hidden" name="client_id" value={clientId} />
        <button disabled={pending} className={btnLightCls} onClick={(e) => { if (!confirm("Esto reemplaza la contraseña actual de la clienta. ¿Continuar?")) e.preventDefault(); }}>
          {pending ? "Generando…" : "Generar contraseña temporal"}
        </button>
      </form>
      {s.error && <p role="alert" className="text-sm font-bold text-danger-text">{s.error}</p>}
      {s.password && (
        <div className="rounded-md border-2 border-forest bg-lime p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider">Contraseña temporal</p>
          <p className="display my-1 select-all text-4xl tracking-widest">{s.password}</p>
          <p className="text-sm font-semibold">Envíasela por WhatsApp. Al entrar, la app le pedirá crear una nueva. Esta pantalla no la vuelve a mostrar.</p>
          <a href={`${whatsapp}${whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(texto)}`} className="mt-3 inline-flex min-h-11 items-center rounded-full border-[1.5px] border-forest bg-white px-5 text-sm font-bold">Enviar por WhatsApp</a>
        </div>
      )}
    </div>
  );
}
