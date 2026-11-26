/** Filtros de la biblioteca y estado leído/pendiente a partir de las sesiones guardadas. */

import type { SessionResult } from "../../../core/types.ts";
import { READING_EXERCISE_ID } from "./session.ts";
import type { ReadingLevel, ReadingTextMeta, ReadingTopic } from "./types.ts";

export type DurationBucket = "corto" | "medio" | "largo";

/** Límites en palabras: los textos son breves a propósito (de 1 a 3 minutos a ritmo medio). */
export const DURATION_LIMITS = { breveMax: 200, medioMax: 400 } as const;

export const DURATION_LABELS: Readonly<Record<DurationBucket, string>> = {
  corto: "Breve (menos de 200 palabras)",
  medio: "Medio (200 a 400 palabras)",
  largo: "Largo (más de 400 palabras)",
};

export function durationBucket(words: number): DurationBucket {
  if (words < DURATION_LIMITS.breveMax) return "corto";
  if (words <= DURATION_LIMITS.medioMax) return "medio";
  return "largo";
}

export type ReadStatusFilter = "todos" | "pendientes" | "leidos";

export interface LibraryFilters {
  topic?: ReadingTopic;
  level?: ReadingLevel;
  duration?: DurationBucket;
  status?: ReadStatusFilter;
}

/** Textos con al menos una sesión de lectura completada. */
export function readTextIds(sessions: readonly SessionResult[]): Set<string> {
  const ids = new Set<string>();
  for (const session of sessions) {
    if (
      session.module === "lectura" &&
      session.exerciseId === READING_EXERCISE_ID &&
      session.outcome === "completada" &&
      session.contentId
    ) {
      ids.add(session.contentId);
    }
  }
  return ids;
}

export function filterCatalog(
  catalog: readonly ReadingTextMeta[],
  filters: LibraryFilters,
  readIds: ReadonlySet<string> = new Set(),
): ReadingTextMeta[] {
  return catalog.filter((text) => {
    if (filters.topic && text.topic !== filters.topic) return false;
    if (filters.level && text.level !== filters.level) return false;
    if (filters.duration && durationBucket(text.words) !== filters.duration) return false;
    if (filters.status === "leidos" && !readIds.has(text.id)) return false;
    if (filters.status === "pendientes" && readIds.has(text.id)) return false;
    return true;
  });
}
