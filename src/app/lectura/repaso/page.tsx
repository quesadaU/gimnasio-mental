import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { ReviewSession } from "@/features/lectura";

export const metadata: Metadata = {
  title: "Repaso del día · Lectura",
  description: "Recuerda de memoria las ideas clave de lo que has leído.",
};

export default function RepasoPage() {
  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link href="/lectura" className="inline-flex min-h-11 items-center underline underline-offset-4">
          ← Volver a Lectura
        </Link>
      </nav>
      <PageHeader eyebrow="Lectura" title="Repaso del día" />
      <div className="pb-12">
        <ReviewSession />
      </div>
    </Container>
  );
}
