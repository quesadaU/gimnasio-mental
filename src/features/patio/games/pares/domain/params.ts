/**
 * Parámetros del juego de parejas (memoria visoespacial y de localización de objetos).
 *
 * El nivel fija el número de parejas (nivel + 2: de 3 a 12). Criterio de ronda bien resuelta:
 * como mucho tantos fallos como parejas. Referencia: con memoria perfecta la estrategia óptima
 * necesita ~1,61·n intentos de media, es decir ~0,61·n fallos (Velleman y Warrington, 2013);
 * permitir n fallos deja margen para el olvido normal sin premiar el azar.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

export type TimingMode = "estandar" | "ampliado" | "sin-limite";

export interface PairsLevelParams {
  level: DifficultyLevel;
  pairs: number;
}

export const PAIRS_LEVELS: readonly PairsLevelParams[] = Array.from({ length: 10 }, (_, i) => ({
  level: (i + 1) as DifficultyLevel,
  pairs: i + 3,
}));

/** Tiempo que quedan visibles dos cartas que no forman pareja; `null` = hasta que la persona siga. */
export const MISMATCH_VISIBLE_MS: Readonly<Record<TimingMode, number | null>> = {
  estandar: 1200,
  ampliado: 2400,
  "sin-limite": null,
};

export const PAIRS_SESSION = {
  rounds: 5,
  practicePairs: 2,
  practiceLevel: 1 as DifficultyLevel,
  /** Fallos permitidos por pareja para que la ronda cuente como acierto en la escalera. */
  maxMismatchesPerPair: 1,
} as const;

export function paramsForLevel(level: DifficultyLevel): PairsLevelParams {
  return PAIRS_LEVELS[level - 1] ?? PAIRS_LEVELS[0];
}
