import Link from "next/link";
import { cardCls, inputCls } from "@/components/owner-ui";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Clientas" };

export default async function ClientasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireOwner();
  const { q = "" } = await searchParams;
  const limpio = q.replace(/[%,()]/g, " ").trim();
  let consulta = supabase.from("profiles").select("id, nombre, celular, creado_en").eq("role", "client").order("creado_en", { ascending: false }).limit(60);
  if (limpio) consulta = consulta.or(`nombre.ilike.%${limpio}%,celular.ilike.%${limpio}%`);
  const { data } = await consulta;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="display text-5xl md:text-7xl">Clientas</h1>
      <form className="flex max-w-lg gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o celular" className={inputCls} />
        <button className="min-h-11 rounded-full border-[1.5px] border-forest bg-forest px-5 text-sm font-bold text-lime">Buscar</button>
      </form>
      {!data?.length ? (
        <p className="rounded-lg border-2 border-dashed border-forest bg-white p-6 font-semibold text-muted">No hay clientas todavía.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((c) => (
            <li key={c.id}>
              <Link href={`/gestion/clientas/${c.id}`} className={`${cardCls} block hover:bg-cream`}>
                <p className="display text-2xl">{c.nombre || "Sin nombre"}</p>
                <p className="font-semibold text-muted">{c.celular}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
