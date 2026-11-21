import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refresca la sesión en cada petición y protege /cuenta y /gestion. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const path = request.nextUrl.pathname;

  const needsLogin = (path.startsWith("/cuenta") && !path.startsWith("/cuenta/acceso")) || path.startsWith("/gestion");
  if (needsLogin && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/acceso";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/cuenta/acceso") && signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta/citas";
    return NextResponse.redirect(url);
  }
  return response;
}
