import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { RepasoSesion } from "@/features/habilidades";

export const metadata: Metadata = {
  title: "Repaso del día · Habilidades",
  description: "Recuerda de memoria lo aprendido, mezclando rutas.",
};

export default function RepasoPage() {
  return (
    <Container size="md">
      <nav aria-label="Migas de pan" className="pt-4 text-sm">
        <Link href="/habilidades" className="inline-flex min-h-11 items-center underline underline-offset-4">
          ← Volver a Habilidades
        </Link>
      </nav>
      <PageHeader eyebrow="Habilidades" title="Repaso del día" />
      <div className="pb-12">
        <RepasoSesion />
      </div>
    </Container>
  );
}
