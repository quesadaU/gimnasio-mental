import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import { ProgressStoreProvider } from "@/components/progress-store-provider";
import { SiteFooter } from "./_components/site-footer";
import { SiteHeader } from "./_components/site-header";
import "./globals.css";

/* Atkinson Hyperlegible: diseñada para máxima legibilidad (baja visión). Fraunces: titulares serenos. */
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gimnasio Mental · Entrena tu atención sin feeds",
    template: "%s · Gimnasio Mental",
  },
  description:
    "Un gimnasio para la mente frente al doomscrolling y la dependencia de la IA: practica pensar sin asistencia con sesiones cortas que tienen final. Sin feeds, sin notificaciones, con tus datos en tu navegador.",
  applicationName: "Gimnasio Mental",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e8" },
    { media: "(prefers-color-scheme: dark)", color: "#111513" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${atkinson.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas font-sans text-ink">
        <a
          href="#contenido"
          className="sr-only z-50 rounded-md bg-primary px-4 py-3 font-semibold text-primary-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Saltar al contenido
        </a>
        <ProgressStoreProvider>
          <SiteHeader />
          <main id="contenido" tabIndex={-1} className="flex flex-1 flex-col pb-16">
            {children}
          </main>
          <SiteFooter />
        </ProgressStoreProvider>
      </body>
    </html>
  );
}
