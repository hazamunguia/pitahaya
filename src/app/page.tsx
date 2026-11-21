import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-pink px-6 text-center">
      <Image src="/brand/logo/pitahaya-logo-horizontal-forest.svg" alt="PITAHAYA Beauty Studio" width={320} height={77} priority />
      <h1 className="display text-6xl sm:text-8xl">Belleza con actitud</h1>
      <p className="max-w-md text-lg font-bold">Estamos preparando la agenda en línea. Muy pronto.</p>
      <span className="rounded-full border-[1.5px] border-forest bg-lime px-6 py-3 font-bold shadow-sticker-sm">Próximamente</span>
    </main>
  );
}
