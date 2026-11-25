import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import Nav, { Announce } from "@/components/Nav";
import { formatDuration, getCourtesies, getDesigns, getServices } from "@/lib/catalog";
import { getStudioInfo } from "@/lib/studio";

const money = (n: number) => `$${Number(n).toLocaleString("es-MX")}`;

async function Services() {
  const services = await getServices();
  return (
    <div className="border-b-[2.5px] border-forest">
      {services.map((s, i) => (
        <Link
          key={s.id}
          href="/reservar"
          className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-x-4 gap-y-1 border-t-[2.5px] border-forest px-2 py-6 transition-colors hover:bg-blush/50 lg:grid-cols-[72px_1.6fr_1.3fr_120px_150px_56px] lg:gap-6 md:px-4"
        >
          <span className="display text-2xl text-magenta-deep md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
          <span className="display col-span-2 text-4xl leading-none md:text-5xl lg:col-span-1">{s.nombre}</span>
          <span className="col-span-3 text-base font-semibold leading-normal lg:col-span-1">{s.descripcion}</span>
          <span className="hidden items-center gap-2 text-sm font-bold lg:flex"><Icon name="clock" size={18} />{formatDuration(s.duracion_min)}</span>
          <span className="display col-span-2 text-3xl text-magenta-deep md:col-span-1 md:text-4xl">
            {money(s.precio_base)}
            {s.admite_diseno && <span className="ml-1 font-sans text-xs font-bold tracking-wider text-muted">DESDE</span>}
          </span>
          <span className="hidden size-13 place-items-center justify-self-end rounded-full border-[1.5px] border-forest bg-lime lg:grid">
            <Icon name="arrow-up-right" size={24} stroke={2.4} />
          </span>
        </Link>
      ))}
    </div>
  );
}

async function Courtesies() {
  const items = await getCourtesies();
  const bg = ["bg-blush", "bg-lime", "bg-cream", "bg-blush"];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((c, i) => (
        <div key={c.id} className={`flex flex-col items-center gap-3.5 rounded-lg border-2 border-forest px-4 py-7 shadow-sticker-sm ${bg[i % bg.length]}`}>
          <Icon name={c.icono ?? "sparkles"} size={44} stroke={1.8} />
          <span className="display text-center text-xl md:text-2xl">{c.nombre}</span>
        </div>
      ))}
    </div>
  );
}

async function Designs() {
  const items = await getDesigns();
  return (
    <div className="grid grid-cols-2 content-start gap-4 md:grid-cols-4">
      {items.map((d) => (
        <div key={d.id} className="rounded-lg border-2 border-forest bg-cream p-4 text-forest shadow-sticker-sm">
          <div className="grid h-24 place-items-center rounded-md bg-blush"><Icon name="palette" size={36} stroke={1.8} /></div>
          <p className="display mt-3 text-xl">{d.nombre}</p>
          <p className="text-sm font-bold text-muted">{Number(d.precio_extra) ? `+${money(d.precio_extra)}` : "Sin costo extra"}</p>
        </div>
      ))}
    </div>
  );
}

const steps = [
  ["1", "Elige el día", "Mira el calendario y escoge el horario que te acomode."],
  ["2", "Escoge tu servicio", "Con el precio a la vista, sin sorpresas."],
  ["3", "Dale estilo", "Un diseño de la casa o tu propia foto para cotizar."],
  ["4", "Pide tu cortesía", "Café, agua de sabor, té o una cosita para brindar."],
];

async function Ciudad() {
  const { ciudad } = await getStudioInfo();
  return <>Beauty Studio{ciudad ? ` · ${ciudad}` : ""}</>;
}

export default function Home() {
  return (
    <>
      <Announce />
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b-[2.5px] border-forest bg-pink">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-12 lg:grid-cols-[1.25fr_1fr] md:px-10 md:pb-28 md:pt-16">
            <div className="relative z-10 flex flex-col gap-6">
              <Image src="/brand/logo/pitahaya-mark.png" alt="" width={150} height={150} className="pointer-events-none absolute -right-12 top-6 -z-10 size-[150px] rotate-[8deg] lg:hidden" />
              <p className="text-xs font-extrabold uppercase tracking-[.14em]"><Suspense fallback="Beauty Studio"><Ciudad /></Suspense></p>
              <h1 className="display text-[84px] leading-[.92] text-forest md:text-[120px] lg:text-[160px] lg:leading-[.9]">
                Belleza<br />con <span className="text-cream">actitud</span>.
              </h1>
              <p className="max-w-xl text-lg font-bold leading-normal md:text-xl">
                Manicure, pedicure, acrílicas y lifting de pestañas con diseños hechos a tu medida. Agenda en minutos, llega y disfruta tu cortesía.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button href="/reservar" size="lg" arrow>Agendar mi cita</Button>
                <Button href="/#servicios" size="lg" kind="light">Ver servicios</Button>
              </div>
            </div>
            <div className="relative hidden h-[520px] lg:block">
              <Image src="/brand/logo/pitahaya-mark.png" alt="" width={520} height={520} className="absolute -right-10 top-0 rotate-[8deg]" />
              <div className="absolute bottom-8 right-0 -rotate-[4deg] rounded-full border-[2.5px] border-forest bg-lime px-6 py-3.5 shadow-sticker">
                <span className="display text-2xl">Cortesía incluida</span>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="scroll-mt-4 bg-cream pb-20 pt-16 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[.14em]">Servicios</p>
                <h2 className="display mt-3 text-6xl md:text-8xl">Lo que hacemos</h2>
              </div>
              <div className="flex max-w-sm flex-col gap-4">
                <p className="text-lg font-semibold">Precios claros desde el primer clic. El diseño de tus uñas se elige al agendar.</p>
                <Button href="/reservar" arrow className="self-start">Agendar</Button>
              </div>
            </div>
            <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-sunken" />}>
              <Services />
            </Suspense>
          </div>
        </section>

        {/* Diseños */}
        <section id="disenos" className="scroll-mt-4 bg-forest py-16 text-cream md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[1fr_2fr] md:gap-14 md:px-10">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-lime">Diseños</p>
              <h2 className="display text-5xl md:text-7xl">Elige tu diseño. O tráenos el tuyo.</h2>
              <p className="text-lg font-medium">Escoge uno de la casa o sube la foto que te inspira. Karina revisa tu imagen y te confirma el precio antes de tu cita.</p>
              <Button href="/reservar" kind="secondary" arrow className="self-start">Agendar con diseño</Button>
            </div>
            <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-leaf" />}>
              <Designs />
            </Suspense>
          </div>
        </section>

        {/* Cómo agendar */}
        <section id="como" className="scroll-mt-4 border-y-[2.5px] border-forest bg-blush py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="display text-5xl md:text-8xl">Agenda en 4 pasos</h2>
              <Button href="/reservar" size="lg" arrow className="self-start">Empezar ahora</Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(([n, t, d]) => (
                <div key={n} className="rounded-lg border-[2.5px] border-forest bg-white p-7 shadow-sticker">
                  <div className="display text-[64px] leading-[.85] text-magenta md:text-[96px]">{n}</div>
                  <div className="display mt-5 text-3xl">{t}</div>
                  <p className="mt-2.5 text-[15px] font-medium">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cortesías */}
        <section id="cortesias" className="scroll-mt-4 border-b-[2.5px] border-forest bg-lime py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="grid items-center gap-10 rounded-xl border-[2.5px] border-forest bg-white p-7 shadow-sticker lg:grid-cols-[1fr_1.4fr] md:gap-12 md:p-12">
              <div className="flex flex-col gap-5">
                <p className="text-xs font-extrabold uppercase tracking-[.14em] text-magenta-deep">Cortesía de la casa</p>
                <h2 className="display text-5xl md:text-6xl">Cada cita incluye algo rico</h2>
                <p className="text-lg font-medium">Mientras te consientes, nosotras cuidamos del resto. Elige hasta 2 al agendar.</p>
              </div>
              <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-sunken" />}>
                <Courtesies />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Charms */}
        <section className="bg-cream py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 lg:grid-cols-[1.2fr_1fr] md:px-10">
            <div className="flex flex-col gap-5">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-magenta-deep">Programa de charms</p>
              <h2 className="display text-5xl md:text-7xl">Cada visita suma</h2>
              <p className="max-w-xl text-lg font-semibold">Llévate un llavero con tu primer charm. Una visita te da un charm y la siguiente, un descuento. Con 5 charms tu manicura o pedicura es gratis, y en tu cita 10 ganas unas uñas completas con el estilo que quieras.</p>
            </div>
            <div className="rounded-xl border-[2.5px] border-forest bg-lime p-8 shadow-sticker">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="grid size-12 place-items-center rounded-full border-2 border-forest bg-white shadow-sticker-sm"><Icon name="sparkles" size={22} /></span>
                ))}
              </div>
              <p className="display mt-5 text-center text-3xl">10 citas · uñas completas gratis</p>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-magenta-deep py-16 text-white md:py-24">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 md:flex-row md:items-center md:px-10">
            <div className="flex flex-col gap-7">
              <h2 className="display text-6xl leading-[1.05] md:text-8xl lg:text-9xl">Tu próxima cita empieza aquí</h2>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button href="/reservar" size="lg" kind="secondary" arrow>Agendar ahora</Button>
                <Button href="/cuenta/acceso" size="lg" kind="light">Entrar a mi cuenta</Button>
              </div>
            </div>
            <Image src="/brand/logo/pitahaya-mark.png" alt="" width={280} height={280} className="hidden shrink-0 -rotate-[8deg] lg:block" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
