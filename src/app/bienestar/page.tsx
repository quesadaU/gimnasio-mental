import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { CrisisResources, PracticeIndex } from "@/features/bienestar";

export const metadata: Metadata = {
  title: "Bienestar mental",
  description:
    "Prácticas breves de respiración, atención plena, registro emocional e higiene digital. No sustituyen a un profesional.",
};

export default function BienestarPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Bienestar mental"
        title="Prácticas para cuidarte"
        description="Ejercicios breves inspirados en técnicas con respaldo científico: respiración lenta, atención plena, poner nombre a las emociones y cuidar tu relación con las pantallas. Son para practicar en el día a día; no son terapia ni sustituyen la ayuda de un profesional."
      />
      <div className="mt-8 space-y-12 pb-12">
        <CrisisResources variant="full" />
        <PracticeIndex />
      </div>
    </Container>
  );
}
