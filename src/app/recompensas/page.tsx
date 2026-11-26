import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Recompensas (próximamente)",
  description: "Reconocimientos por constancia y mejora personal, no por tiempo en pantalla. Todavía no disponible.",
};

export default function RecompensasPage() {
  return (
    <ComingSoon
      title="Recompensas y tienda"
      description="Estamos diseñando un sistema de reconocimientos que te ayude a volver, no a quedarte enganchado."
      willDo={[
        "La constancia: volver varios días a la semana, aunque sean sesiones cortas.",
        "La mejora personal frente a tu propio punto de partida en cada ejercicio.",
        "La variedad: alternar entre atención, memoria, lectura, habilidades y bienestar.",
      ]}
      wontDo={[
        "Premiar el tiempo en pantalla ni las sesiones maratonianas.",
        "Castigarte por romper una racha o meterte prisa con cuentas atrás.",
        "Venderte ventajas con dinero real ni mostrarte anuncios.",
      ]}
    />
  );
}
