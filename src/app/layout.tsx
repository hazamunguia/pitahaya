import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource-variable/montserrat/wght.css";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "PITAHAYA Beauty Studio", template: "%s · PITAHAYA Beauty Studio" },
  description: "Uñas, pedicure, lifting de pestañas y más. Agenda tu cita en línea y elige tu diseño.",
  manifest: "/pwa/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa/favicon.svg", type: "image/svg+xml" },
      { url: "/pwa/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/pwa/apple-touch-icon.png",
  },
  openGraph: { title: "PITAHAYA Beauty Studio", description: "Agenda tu cita en línea.", images: ["/og-image.png"], locale: "es_MX", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ec6295", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
