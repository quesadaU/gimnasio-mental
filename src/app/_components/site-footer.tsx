import Link from "next/link";
import { Container } from "@/components/ui";
import { MODULES } from "@/core/modules-registry";

export function SiteFooter() {
  const links = MODULES.filter((module) => module.status === "activo");

  return (
    <footer className="mt-auto border-t border-line bg-surface-2/60">
      <Container className="grid gap-8 py-10 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-ink">Lo que hacemos y lo que no</h2>
          <p className="max-w-prose text-ink-muted">
            Gimnasio Mental <strong className="text-ink">no promete subir tu CI</strong>, prevenir la demencia ni
            curar nada. Entrenamos tareas concretas y hábitos de atención: la mejora que mide la investigación
            suele quedarse en la tarea que practicas, por eso te proponemos alternar dominios y te mostramos el
            progreso por ejercicio.
          </p>
          <p className="max-w-prose text-ink-muted">
            Tus datos se guardan solo en este navegador. No sustituye a la ayuda profesional: si estás pasando un
            mal momento, en España puedes llamar al <strong className="text-ink">024</strong> (gratuito, 24 horas).
          </p>
        </div>
        <nav aria-label="Pie de página">
          <ul className="flex flex-col gap-1">
            {links.map((module) => (
              <li key={module.slug}>
                <Link
                  href={module.href}
                  className="inline-flex min-h-10 items-center text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  {module.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
