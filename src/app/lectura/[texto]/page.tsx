import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LECTURA_CATALOG } from "@/content/lectura";
import { Container } from "@/components/ui";
import { ReadingSession } from "@/features/lectura";

interface TextPageProps {
  params: Promise<{ texto: string }>;
}

export function generateStaticParams() {
  return LECTURA_CATALOG.map((text) => ({ texto: text.id }));
}

export async function generateMetadata({ params }: TextPageProps): Promise<Metadata> {
  const { texto } = await params;
  const meta = LECTURA_CATALOG.find((text) => text.id === texto);
  if (!meta) return { title: "Texto no encontrado" };
  return { title: `${meta.title} · Lectura`, description: meta.summary };
}

export default async function TextPage({ params }: TextPageProps) {
  const { texto } = await params;
  const meta = LECTURA_CATALOG.find((text) => text.id === texto);
  if (!meta) notFound();

  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link href="/lectura" className="inline-flex min-h-11 items-center underline underline-offset-4">
          ← Volver a la biblioteca
        </Link>
      </nav>
      <h1 className="pb-6 pt-4 text-3xl font-semibold text-ink sm:text-4xl">{meta.title}</h1>
      <div className="pb-12">
        <ReadingSession textId={meta.id} />
      </div>
    </Container>
  );
}
