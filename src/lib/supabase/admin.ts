import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Cliente con permisos totales. SOLO para código de servidor (acciones y rutas API). */
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
