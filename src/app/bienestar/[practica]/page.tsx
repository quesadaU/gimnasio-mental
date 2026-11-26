import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/ui";
import { BIENESTAR_PRACTICES, CrisisResources, PRACTICE_CATEGORIES, PracticeRunner, findPractice } from "@/features/bienestar";

interface PracticePageProps {
  params: Promise<{ practica: string }>;
}

export function generateStaticParams() {
  return BIENESTAR_PRACTICES.map((practice) => ({ practica: practice.slug }));
}

export async function generateMetadata({ params }: PracticePageProps): Promise<Metadata> {
  const { practica } = await params;
  const practice = findPractice(practica);
  if (!practice) return { title: "Práctica no encontrada" };
  return { title: `${practice.definition.title} · Bienestar`, description: practice.purpose };
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { practica } = await params;
  const practice = findPractice(practica);
  if (!practice) notFound();
  const category = PRACTICE_CATEGORIES.find((c) => c.id === practice.category);

  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link
          href="/bienestar"
          className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2"
        >
          ← Volver a Bienestar
        </Link>
      </nav>
      <PageHeader eyebrow={category?.title} title={practice.definition.title} description={practice.purpose} />
      <div className="mt-8 space-y-12 pb-12">
        <PracticeRunner slug={practice.slug} />
        <CrisisResources variant="compact" />
      </div>
    </Container>
  );
}
