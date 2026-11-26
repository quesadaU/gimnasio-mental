import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Rankings (próximamente)",
  description: "Comparativas opcionales basadas en mejora personal, no en tiempo de uso. Todavía no disponible.",
};

export default function RankingsPage() {
  return (
    <ComingSoon
      title="Rankings"
      description="Si llegan, serán opcionales y pensados para motivar, no para compararte sin parar con desconocidos."
      willTitle="Cómo funcionarán"
      willDo={[
        "Ligas por mejora personal: cuánto avanzas respecto a tu propia línea base.",
        "La constancia semanal, con sesiones cortas que cuentan igual.",
        "Participar solo si lo activas tú; por defecto nadie ve tus datos.",
      ]}
      wontDo={[
        "Una tabla global infinita para mirar cada día.",
        "Medir quién pasa más tiempo en la app.",
        "Publicar tus resultados sin tu consentimiento explícito.",
      ]}
      footnote={
        <p>
          Para que sean justos necesitarán cuentas opcionales y un servidor que compruebe los resultados. Hoy tus
          datos viven solo en tu navegador y no se envían a ningún sitio.
        </p>
      }
    />
  );
}
