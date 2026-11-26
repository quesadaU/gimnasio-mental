import Link from "next/link";
import { ButtonLink, Card, Container } from "@/components/ui";
import { RecommendedSession, trainingModules } from "@/features/progreso";

const PRINCIPLES = [
  {
    title: "Piensa tú primero",
    text: "Aquí nadie resuelve por ti. Sin asistentes ni pistas automáticas: el esfuerzo de recordar y razonar es el entrenamiento.",
  },
  {
    title: "Cada sesión termina",
    text: "De 5 a 15 minutos, con una pantalla de fin. Sin autoplay, sin feed infinito, sin notificaciones que te reclamen.",
  },
  {
    title: "Alterna dominios",
    text: "Lo que practicas mejora sobre todo en esa tarea. Por eso combinamos atención, memoria, lectura, habilidades reales y calma.",
  },
  {
    title: "Sin trampas",
    text: "No castigamos las rachas rotas ni inventamos urgencias. Volver mañana cuenta más que quedarse una hora hoy.",
  },
] as const;

export default function Home() {
  const modules = trainingModules();

  return (
    <>
      <section aria-labelledby="hero-title" className="border-b border-line">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-start lg:gap-14 lg:py-20">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Un gimnasio para la atención
            </p>
            <h1 id="hero-title" className="text-[2.6rem] font-semibold leading-[1.05] text-ink sm:text-6xl">
              Deja de deslizar. <span className="italic text-primary">Vuelve a pensar.</span>
            </h1>
            <p className="max-w-xl text-lg text-ink-muted sm:text-xl">
              Frente al doomscrolling y a delegarlo todo en la IA: práctica deliberada de pensar sin asistencia.
              Puzzles, lectura profunda, habilidades y calma, en sesiones cortas que tienen final.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/patio" size="lg">
                Empezar a entrenar
              </ButtonLink>
              <ButtonLink href="#principios" variant="ghost" size="lg">
                Cómo funciona
              </ButtonLink>
            </div>
            <div aria-hidden="true" className="gm-ticks mt-2 w-56" />
          </div>

          <Card as="aside" aria-labelledby="hoy-title" className="gm-rise border-line-strong/30">
            <div className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 id="hoy-title" className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Sesión recomendada de hoy
                </h2>
              </div>
              <RecommendedSession />
            </div>
          </Card>
        </Container>
      </section>

      <section aria-labelledby="modulos-title" className="py-14 sm:py-16">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 id="modulos-title" className="text-3xl font-semibold text-ink sm:text-4xl">
              Cuatro salas, un mismo propósito
            </h2>
            <p className="max-w-2xl text-ink-muted">
              Elige una sala, haz una sesión y sal. Mañana, prueba otra.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {modules.map((module, index) => (
              <li key={module.slug}>
                <Card className="h-full transition-colors focus-within:border-line-strong hover:border-line-strong">
                  <div className="flex h-full flex-col gap-3 p-5 sm:p-6">
                    <span aria-hidden="true" className="font-display text-sm font-semibold tabular-nums text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl font-semibold text-ink">
                      {/* Enlace extendido: toda la tarjeta es clicable, con un único punto de tabulación. */}
                      <Link
                        href={module.href}
                        className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
                      >
                        {module.title}
                      </Link>
                    </h3>
                    <p className="flex-1 text-ink-muted">{module.description}</p>
                    <span aria-hidden="true" className="font-semibold text-primary">
                      Entrar →
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="principios" aria-labelledby="principios-title" className="border-t border-line bg-surface-2/50 py-14 sm:py-16">
        <Container className="flex flex-col gap-8">
          <h2 id="principios-title" className="text-3xl font-semibold text-ink sm:text-4xl">
            Cómo funciona
          </h2>
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((principle, index) => (
              <li key={principle.title} className="flex flex-col gap-2 border-t-2 border-ink pt-4">
                <span aria-hidden="true" className="text-sm font-semibold tabular-nums text-ink-muted">
                  {index + 1} / {PRINCIPLES.length}
                </span>
                <h3 className="text-xl font-semibold text-ink">{principle.title}</h3>
                <p className="text-ink-muted">{principle.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
