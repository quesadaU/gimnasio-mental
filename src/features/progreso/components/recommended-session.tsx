"use client";

import { ButtonLink, EmptyState, ErrorState, LoadingState } from "@/components/ui";
import type { ProgressStore } from "@/core/types";
import { recommendNextModule } from "../domain/recommendation.ts";
import { formatDaysAgo, moduleTitle } from "./format";
import { trainingModules } from "./training-modules";
import { useStoreData } from "./use-store-data";

async function readSessions(store: ProgressStore) {
  return { sessions: await store.listSessions(), now: new Date() };
}

/** Bloque "Sesión recomendada de hoy": alterna dominios según el historial local. */
export function RecommendedSession() {
  const { state, reload } = useStoreData(readSessions);
  const modules = trainingModules();

  if (state.status === "loading") return <LoadingState label="Preparando la sesión de hoy…" />;

  if (state.status === "error") {
    return (
      <ErrorState
        title="No hemos podido leer tu historial"
        description="Tus datos siguen en este navegador. Puedes reintentarlo o empezar igualmente una sesión."
        onRetry={reload}
      />
    );
  }

  const { sessions, now } = state.data;
  const recommendation = recommendNextModule(
    sessions,
    modules.map((module) => module.slug),
  );
  const target = modules.find((module) => module.slug === recommendation?.module);
  if (!recommendation || !target) {
    return <EmptyState title="No hay módulos disponibles todavía" />;
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        className="border-0 bg-transparent p-0"
        title="Aún no has entrenado aquí"
        description={
          <p>
            Empieza por <strong className="text-ink">{target.title}</strong>: una sesión corta, de 5 a 15
            minutos, que termina sola. Mañana te sugeriremos otro dominio.
          </p>
        }
        action={
          <ButtonLink href={target.href} size="md">
            Empezar en {target.title}
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-2xl font-semibold text-ink">Hoy toca: {target.title}</p>
      <p className="text-ink-muted">{reasonText(recommendation, now)}</p>
      <p className="text-sm text-ink-muted">Una sesión de 5 a 15 minutos. Cuando acabe, acabó.</p>
      <div>
        <ButtonLink href={target.href}>Ir a {target.title}</ButtonLink>
      </div>
    </div>
  );
}

function reasonText(
  recommendation: NonNullable<ReturnType<typeof recommendNextModule>>,
  now: Date,
): string {
  const previous = recommendation.previousModule
    ? `Tu última sesión fue de ${moduleTitle(recommendation.previousModule)}. `
    : "";
  if (recommendation.reason === "sin-empezar") {
    return `${previous}Todavía no has probado este módulo; alternar dominios aporta más que repetir el mismo ejercicio.`;
  }
  const when = recommendation.lastPracticedAt
    ? formatDaysAgo(recommendation.lastPracticedAt, now)
    : "hace tiempo";
  return `${previous}Es el dominio que practicaste hace más tiempo (${when}).`;
}
