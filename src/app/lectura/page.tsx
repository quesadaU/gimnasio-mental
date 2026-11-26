import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { Library } from "@/features/lectura";

export const metadata: Metadata = {
  title: "Lectura",
  description:
    "Textos breves para leer sin distracciones, explicar con tus palabras y repasar con repetición espaciada.",
};

export default function LecturaPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Lectura profunda"
        title="Lee un texto entero, sin saltar"
        description="Textos breves para practicar la atención sostenida. Después de leer explicas la idea con tus palabras y respondes de memoria. Tus resultados se guardan solo en este dispositivo."
      />
      <div className="pb-12">
        <Library />
      </div>
    </Container>
  );
}
