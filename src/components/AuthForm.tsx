"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { crearCuenta, entrar, type AuthState } from "@/app/cuenta/acceso/actions";

const initial: AuthState = {};
const input =
  "min-h-12 w-full rounded-md border-[1.5px] border-forest bg-white px-4 text-base font-medium text-forest placeholder:text-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-magenta";

export default function AuthForm({ next }: { next?: string }) {
  const [mode, setMode] = useState<"entrar" | "crear">("entrar");
  const [loginState, loginAction, loginPending] = useActionState(entrar, initial);
  const [signupState, signupAction, signupPending] = useActionState(crearCuenta, initial);
  const isLogin = mode === "entrar";
  const state = isLogin ? loginState : signupState;
  const pending = isLogin ? loginPending : signupPending;

  return (
    <main className="grid min-h-screen place-items-center bg-pink px-5 py-10">
      <div className="w-full max-w-md">
        <Image src="/brand/logo/pitahaya-logo-horizontal-forest.svg" alt="PITAHAYA Beauty Studio" width={220} height={53} priority className="mx-auto mb-6" />
        <div className="rounded-lg border-[2.5px] border-forest bg-card p-7 shadow-sticker">
          <div className="mb-6 flex gap-2" role="tablist">
            {(["entrar", "crear"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`min-h-11 flex-1 rounded-full border-[1.5px] border-forest text-sm font-bold ${mode === m ? "bg-forest text-lime" : "bg-cream text-forest"}`}
              >
                {m === "entrar" ? "Entrar" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <h1 className="display text-4xl">{isLogin ? "Entra con tu celular" : "Crea tu cuenta"}</h1>

          <form action={isLogin ? loginAction : signupAction} className="mt-5 flex flex-col gap-4" key={mode}>
            {next && <input type="hidden" name="next" value={next} />}
            {!isLogin && (
              <label className="flex flex-col gap-1.5 text-sm font-bold">
                Nombre
                <input name="nombre" autoComplete="name" required className={input} placeholder="Como te llamamos" />
              </label>
            )}
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Celular
              <input name="celular" type="tel" inputMode="numeric" autoComplete="tel-national" required className={input} placeholder="55 0000 0000" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">
              Contraseña
              <input name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={isLogin ? undefined : 8} className={input} placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"} />
            </label>

            {state.error && (
              <p role="alert" className="rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger-text">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="min-h-14 rounded-full border-[1.5px] border-forest bg-forest px-8 text-lg font-bold text-lime shadow-sticker-sm disabled:opacity-60">
              {pending ? "Un momento…" : isLogin ? "Entrar" : "Crear mi cuenta"}
            </button>
          </form>

          {isLogin && <p className="mt-5 text-center text-sm font-semibold text-muted">¿Olvidaste tu contraseña? Escríbele a Karina y te da una temporal.</p>}
        </div>
      </div>
    </main>
  );
}
