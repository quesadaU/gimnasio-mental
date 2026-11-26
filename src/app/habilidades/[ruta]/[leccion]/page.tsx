import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RUTAS } from "@/content/habilidades";
import { Container } from "@/components/ui";
import { LeccionSesion } from "@/features/habilidades";

interface LeccionPageProps {
  params: Promise<{ ruta: string; leccion: string }>;
}

export function generateStaticParams() {
  return RUTAS.flatMap((r) => r.lecciones.map((l) => ({ ruta: r.slug, leccion: l.id })));
}

function buscar(ruta: string, leccion: string) {
  const definicion = RUTAS.find((r) => r.slug === ruta);
  const indice = definicion?.lecciones.find((l) => l.id === leccion);
  return definicion && indice ? { definicion, indice } : undefined;
}

export async function generateMetadata({ params }: LeccionPageProps): Promise<Metadata> {
  const { ruta, leccion } = await params;
  const encontrada = buscar(ruta, leccion);
  if (!encontrada) return { title: "Lección no encontrada" };
  return {
    title: `${encontrada.indice.titulo} · ${encontrada.definicion.titulo}`,
    description: encontrada.indice.descripcion,
  };
}

export default async function LeccionPage({ params }: LeccionPageProps) {
  const { ruta, leccion } = await params;
  const encontrada = buscar(ruta, leccion);
  if (!encontrada) notFound();
  const { definicion, indice } = encontrada;
  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link
          href={`/habilidades/${definicion.slug}`}
          className="inline-flex min-h-11 items-center underline underline-offset-4"
        >
          ← Volver a {definicion.titulo}
        </Link>
      </nav>
      <h1 className="pb-6 pt-4 text-3xl font-semibold text-ink sm:text-4xl">{indice.titulo}</h1>
      <div className="pb-12">
        <LeccionSesion ruta={definicion.slug} leccionId={indice.id} />
      </div>
    </Container>
  );
}
