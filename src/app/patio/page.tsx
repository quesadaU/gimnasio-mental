import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { PatioCatalog } from "@/features/patio";

export const metadata: Metadata = {
  title: "Patio de juegos",
  description:
    "Ajedrez táctico, sudoku, matrices, deducción y ejercicios de atención y memoria con dificultad adaptativa y sesiones cortas.",
};

export default function PatioPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Patio de juegos"
        title="Juegos para pensar con calma"
        description={
          <>
            <p>
              Sesiones cortas con final, sin cronómetros que presionen salvo en los ejercicios de atención. La
              dificultad se ajusta a tu rendimiento para que cada partida sea exigente pero alcanzable.
            </p>
            <p className="mt-3 text-base">
              Lo que mejora con la práctica es, sobre todo, la tarea que practicas. Por eso conviene alternar
              grupos en lugar de repetir siempre el mismo juego.
            </p>
          </>
        }
      />
      <div className="pb-12">
        <PatioCatalog />
      </div>
    </Container>
  );
}
