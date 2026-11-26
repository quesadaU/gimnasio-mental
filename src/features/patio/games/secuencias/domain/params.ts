/**
 * Parámetros de las tareas de amplitud (span):
 * - dígitos en orden directo e inverso (formato de las escalas de Wechsler);
 * - espacial en orden directo, tipo bloques de Corsi (Corsi, 1972; Kessels et al., 2000).
 *
 * El nivel fija la longitud de la secuencia: nivel + 2 elementos (nivel 1 = 3, nivel 10 = 12).
 * Referencias orientativas en adultos: directo ~6-7, inverso ~4-5, Corsi ~5-6. Los niveles altos
 * existen para que la escalera nunca toque techo, no porque se esperen.
 * La respuesta nunca tiene límite de tiempo; solo la presentación es temporizada, y el modo
 * ampliado la ralentiza (WCAG 2.2.1).
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

export type SpanVariant = "digitos-directo" | "digitos-inverso" | "espacial";
export type PresentationMode = "estandar" | "ampliado";

export interface SpanLevelParams {
  level: DifficultyLevel;
  length: number;
}

export const SPAN_LEVELS: readonly SpanLevelParams[] = Array.from({ length: 10 }, (_, i) => ({
  level: (i + 1) as DifficultyLevel,
  length: i + 3,
}));

export const PRESENTATION_TIMING: Readonly<Record<PresentationMode, { itemMs: number; gapMs: number }>> = {
  estandar: { itemMs: 1000, gapMs: 250 },
  ampliado: { itemMs: 1500, gapMs: 400 },
};

/** Dígitos 1-9 (sin 0, como en las escalas clásicas). Rejilla espacial de 4 x 4. */
export const DIGIT_POOL: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const SPATIAL_GRID_SIZE = 4;

export const SPAN_SESSION = {
  trials: 14,
  practiceTrials: 2,
  practiceLevel: 1 as DifficultyLevel,
  /** Aviso "atención" antes de cada secuencia. */
  readyMs: 900,
} as const;

export function paramsForLevel(level: DifficultyLevel): SpanLevelParams {
  return SPAN_LEVELS[level - 1] ?? SPAN_LEVELS[0];
}
