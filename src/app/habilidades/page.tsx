import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { Catalogo } from "@/features/habilidades";

export const metadata: Metadata = {
  title: "Habilidades",
  description:
    "Rutas de aprendizaje de programación, matemáticas, filosofía, artes y pensamiento crítico, basadas en práctica de recuperación.",
};

export default function HabilidadesPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Aprendizaje de habilidades"
        title="Aprende haciendo, no solo leyendo"
        description="Lecciones breves que te piden intentar, recordar y repasar con el tiempo. Tu progreso se guarda solo en este dispositivo."
      />
      <div className="pb-12">
        <Catalogo />
      </div>
    </Container>
  );
}
