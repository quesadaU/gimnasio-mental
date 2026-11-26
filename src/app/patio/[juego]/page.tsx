import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";
import { ExerciseRunner, PATIO_ENTRIES, findPatioDefinition } from "@/features/patio";

interface GamePageProps {
  params: Promise<{ juego: string }>;
}

/** Todos los juegos registrados se prerenderizan; un id desconocido da 404. */
export function generateStaticParams() {
  return PATIO_ENTRIES.map((entry) => ({ juego: entry.definition.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { juego } = await params;
  const definition = findPatioDefinition(juego);
  if (!definition) return { title: "Juego no encontrado" };
  return { title: `${definition.title} · Patio`, description: definition.description };
}

export default async function GamePage({ params }: GamePageProps) {
  const { juego } = await params;
  const definition = findPatioDefinition(juego);
  if (!definition) notFound();

  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link
          href="/patio"
          className="inline-flex min-h-11 items-center underline underline-offset-4"
        >
          ← Volver al Patio
        </Link>
      </nav>
      <PageHeader eyebrow="Patio de juegos" title={definition.title} description={definition.description} />
      <div className="pb-12">
        <ExerciseRunner exerciseId={definition.id} />
      </div>
    </Container>
  );
}
