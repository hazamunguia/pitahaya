import Image from "next/image";
import Link from "next/link";
import { getStudioInfo, waLink } from "@/lib/studio";

export default async function Footer() {
  const info = await getStudioInfo();
  return (
    <footer className="bg-forest pb-7 pt-16 text-cream">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 md:flex-row md:justify-between md:px-10">
        <div className="flex max-w-sm flex-col gap-5">
          <Image src="/brand/logo/pitahaya-logo-horizontal-cream.svg" alt="PITAHAYA Beauty Studio" width={220} height={53} />
          <p className="font-medium">Belleza con actitud. Uñas, pestañas y cuidado con diseño hecho a tu medida.</p>
        </div>
        <div className="grid grid-cols-2 gap-10 md:flex md:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-lime">Estudio</p>
            <Link href="/#servicios" className="font-semibold">Servicios</Link>
            <Link href="/#disenos" className="font-semibold">Diseños</Link>
            <Link href="/#como" className="font-semibold">Cómo agendar</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-lime">Tu cuenta</p>
            <Link href="/reservar" className="font-semibold">Agendar cita</Link>
            <Link href="/cuenta/citas" className="font-semibold">Mis citas</Link>
          </div>
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <p className="text-xs font-extrabold uppercase tracking-widest text-lime">Visítanos</p>
            <span className="font-semibold">{info.direccion || "Dirección próximamente"}{info.ciudad ? `, ${info.ciudad}` : ""}</span>
            <span className="font-semibold">Lun a Vie 10:00 a 18:00 · Sáb 10:00 a 16:00</span>
            {info.telefono ? <a href={waLink(info.telefono)} className="font-semibold underline">{info.telefono}</a> : <span className="font-semibold">WhatsApp próximamente</span>}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-7xl px-5 md:px-10"><div className="flex flex-col justify-between gap-2 border-t border-lime pt-5 text-sm font-semibold sm:flex-row sm:gap-4">
        <span>© 2026 PITAHAYA Beauty Studio</span>
        <span>Aviso de privacidad · Términos</span>
      </div></div>
    </footer>
  );
}
