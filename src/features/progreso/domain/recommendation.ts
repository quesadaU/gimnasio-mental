/**
 * Sesión recomendada de hoy (criterio 8.3: alternar dominios, porque la transferencia es estrecha).
 * Regla simple y explicable:
 *   1. Si hay módulos de entrenamiento sin practicar nunca, el primero en el orden dado.
 *   2. Si no, el módulo practicado hace más tiempo (nunca el de la última sesión, salvo que solo haya uno).
 */

import type { IsoDateTime, ModuleSlug, SessionResult } from "../../../core/types.ts";
import { compareIso } from "./summary.ts";

export type RecommendationReason = "sin-empezar" | "hace-mas-tiempo";

export interface Recommendation {
  module: ModuleSlug;
  reason: RecommendationReason;
  lastPracticedAt?: IsoDateTime;
  /** Módulo de la sesión más reciente, para explicar la alternancia ("ayer hiciste X"). */
  previousModule?: ModuleSlug;
}

export function recommendNextModule(
  sessions: readonly Pick<SessionResult, "module" | "endedAt">[],
  trainingModules: readonly ModuleSlug[],
): Recommendation | undefined {
  if (trainingModules.length === 0) return undefined;

  const lastByModule = new Map<ModuleSlug, IsoDateTime>();
  let latest: Pick<SessionResult, "module" | "endedAt"> | undefined;
  for (const session of sessions) {
    if (!trainingModules.includes(session.module)) continue;
    const previous = lastByModule.get(session.module);
    if (!previous || compareIso(session.endedAt, previous) > 0) {
      lastByModule.set(session.module, session.endedAt);
    }
    if (!latest || compareIso(session.endedAt, latest.endedAt) > 0) latest = session;
  }

  const previousModule = latest?.module;
  const untouched = trainingModules.find((module) => !lastByModule.has(module));
  if (untouched) return { module: untouched, reason: "sin-empezar", previousModule };

  let oldest: ModuleSlug = trainingModules[0];
  for (const slug of trainingModules) {
    if (compareIso(lastByModule.get(slug)!, lastByModule.get(oldest)!) < 0) oldest = slug;
  }
  return {
    module: oldest,
    reason: "hace-mas-tiempo",
    lastPracticedAt: lastByModule.get(oldest),
    previousModule,
  };
}
