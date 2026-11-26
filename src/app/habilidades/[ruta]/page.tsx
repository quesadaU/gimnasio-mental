import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RUTAS } from "@/content/habilidades";
import { Container, PageHeader } from "@/components/ui";
import { Temario } from "@/features/habilidades";

interface RutaPageProps {
  params: Promise<{ ruta: string }>;
}

export function generateStaticParams() {
  return RUTAS.map((r) => ({ ruta: r.slug }));
}

export async function generateMetadata({ params }: RutaPageProps): Promise<Metadata> {
  const { ruta } = await params;
  const definicion = RUTAS.find((r) => r.slug === ruta);
  if (!definicion) return { title: "Ruta no encontrada" };
  return { title: `${definicion.titulo} · Habilidades`, description: definicion.descripcion };
}

export default async function RutaPage({ params }: RutaPageProps) {
  const { ruta } = await params;
  const definicion = RUTAS.find((r) => r.slug === ruta);
  if (!definicion) notFound();
  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link href="/habilidades" className="inline-flex min-h-11 items-center underline underline-offset-4">
          ← Volver a Habilidades
        </Link>
      </nav>
      <PageHeader eyebrow="Ruta de aprendizaje" title={definicion.titulo} description={definicion.descripcion} />
      <div className="pb-12">
        <Temario ruta={definicion} />
      </div>
    </Container>
  );
}
