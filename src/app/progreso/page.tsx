import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { ProgressDashboard } from "@/features/progreso";

export const metadata: Metadata = {
  title: "Progreso",
  description: "Tu historial de sesiones por módulo, guardado solo en este navegador. Exporta o importa una copia.",
};

export default function ProgresoPage() {
  return (
    <Container size="lg">
      <PageHeader
        eyebrow="Progreso"
        title="Tu historial de entrenamiento"
        description="Lo que has practicado, por módulo y por sesión. Se mide cada tarea por separado: mejorar en un ejercicio no significa mejorar en todo, y está bien."
      />
      <ProgressDashboard />
    </Container>
  );
}
