import OwnerForm from "@/components/OwnerForm";
import PushToggle from "@/components/PushToggle";
import { cardCls, inputCls, labelCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";
import { getStudioInfo } from "@/lib/studio";
import { guardarAjustes } from "../actions";

export const metadata = { title: "Ajustes" };

export default async function AjustesPage() {
  await requireOwner();
  const info = await getStudioInfo();
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Ajustes</h1>
      <section className={cardCls}>
        <h2 className="display mb-4 text-3xl">Datos del estudio</h2>
        <OwnerForm action={guardarAjustes} key={JSON.stringify(info)}>
          <label className={labelCls}>Ciudad<input name="ciudad" defaultValue={info.ciudad} className={inputCls} placeholder="Ej. Ecatepec" /></label>
          <label className={labelCls}>Dirección<input name="direccion" defaultValue={info.direccion} className={inputCls} placeholder="Calle, número, colonia" /></label>
          <label className={labelCls}>Teléfono / WhatsApp (10 dígitos)<input name="telefono" type="tel" defaultValue={info.telefono} className={inputCls} /></label>
          <label className={labelCls}>Horas de anticipación para cancelar o reagendar<input name="horas_cancelacion" type="number" min="0" max="240" defaultValue={info.horas_cancelacion} className={inputCls} /></label>
        </OwnerForm>
      </section>
      <section className={cardCls}>
        <h2 className="display text-3xl">Avisos en este dispositivo</h2>
        <p className="mb-4 mt-1 font-semibold text-muted">Recibe una notificación cuando alguien agenda, cambia o cancela una cita. Actívalo en cada dispositivo donde quieras recibirlos.</p>
        <PushToggle />
      </section>
    </div>
  );
}
