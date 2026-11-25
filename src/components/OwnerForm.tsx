"use client";

import { useActionState } from "react";
import { btnCls } from "./owner-ui";

export type OwnerState = { error?: string; ok?: string };

export default function OwnerForm({ action, children, label = "Guardar", className = "flex flex-col gap-4" }: {
  action: (prev: OwnerState, form: FormData) => Promise<OwnerState>;
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [s, formAction, pending] = useActionState(action, {} as OwnerState);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={btnCls}>{pending ? "Guardando…" : label}</button>
        {s.ok && <span role="status" className="text-sm font-bold text-leaf">{s.ok}</span>}
        {s.error && <span role="alert" className="text-sm font-bold text-danger-text">{s.error}</span>}
      </div>
    </form>
  );
}
