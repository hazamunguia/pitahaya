/** Normaliza un celular mexicano a 10 dígitos. Devuelve null si no es válido. */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  const ten = d.length === 12 && d.startsWith("52") ? d.slice(2) : d;
  return /^\d{10}$/.test(ten) ? ten : null;
}

/** Supabase Auth necesita correo: usamos uno interno derivado del celular. */
export function phoneToEmail(phone10: string): string {
  return `${phone10}@cel.pitahaya.app`;
}
