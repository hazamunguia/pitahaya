# PITAHAYA Beauty Studio

Sitio web, reservas en línea, panel de clienta y panel de gestión (PWA con avisos push).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS 4 · Supabase (base de datos, sesiones, imágenes) · Web Push.

## Empezar

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

## Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run lint`

## Estructura

```
src/app/        rutas (sitio, /reservar, /cuenta, /gestion)
public/brand/   logos, iconos y patrones
public/pwa/     iconos de app y manifiestos
docs/           rutas, modelo de datos, API, PWA, sistema de diseño
```

## Publicar

1. Sube el repositorio a GitHub.
2. Importa el repositorio en Vercel o Cloudflare (framework: Next.js; no requiere configuración).
3. Agrega las variables de `.env.example` en el panel del proveedor.

> Vercel Hobby es solo para uso no comercial; para el negocio revisa sus términos o usa Cloudflare.
