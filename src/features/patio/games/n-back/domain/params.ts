/**
 * Parámetros de n-back visual de letras (Kirchner, 1958; versión adaptativa por bloques de
 * Jaeggi et al., 2008: bloques de 20 + n ensayos con 6 coincidencias).
 *
 * El nivel cambia (ARQUITECTURA.md §4.1) el valor de n y el ritmo (intervalo entre letras).
 * Desde el nivel 5 se añaden "señuelos" (la letra coincide con n-1 o n+1 posiciones atrás), que
 * exigen recordar la posición exacta y no solo la familiaridad (Kane et al., 2007).
 *
 * Diferencia con Jaeggi (2008): allí se sube con < 3 errores y se baja con > 5. Aquí se usa la
 * escalera común 2-arriba/1-abajo por bloques: un bloque es acierto si tiene <= 3 errores.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

export type TimingMode = "estandar" | "ampliado" | "sin-limite";

export interface NBackLevelParams {
  level: DifficultyLevel;
  n: number;
  /** Tiempo entre el inicio de una letra y el de la siguiente; es la ventana de respuesta. */
  trialMs: number;
  /** Tiempo que la letra permanece visible. */
  stimulusMs: number;
  luresPerBlock: number;
}

export const N_BACK_LEVELS: readonly NBackLevelParams[] = [
  { level: 1, n: 1, trialMs: 3000, stimulusMs: 1000, luresPerBlock: 0 },
  { level: 2, n: 1, trialMs: 2500, stimulusMs: 1000, luresPerBlock: 0 },
  { level: 3, n: 2, trialMs: 3000, stimulusMs: 1000, luresPerBlock: 0 },
  { level: 4, n: 2, trialMs: 2500, stimulusMs: 800, luresPerBlock: 0 },
  { level: 5, n: 2, trialMs: 2500, stimulusMs: 800, luresPerBlock: 2 },
  { level: 6, n: 3, trialMs: 3000, stimulusMs: 1000, luresPerBlock: 0 },
  { level: 7, n: 3, trialMs: 2500, stimulusMs: 800, luresPerBlock: 2 },
  { level: 8, n: 3, trialMs: 2000, stimulusMs: 700, luresPerBlock: 3 },
  { level: 9, n: 4, trialMs: 2500, stimulusMs: 800, luresPerBlock: 2 },
  { level: 10, n: 4, trialMs: 2000, stimulusMs: 700, luresPerBlock: 3 },
];

/** En n-back el ritmo forma parte de la carga; el modo ampliado lo alarga un 50 %. */
export const TIMING_MULTIPLIER: Readonly<Record<TimingMode, number | null>> = {
  estandar: 1,
  ampliado: 1.5,
  "sin-limite": null,
};

export const N_BACK_SESSION = {
  blocks: 6,
  baseBlockLength: 20,
  targetsPerBlock: 6,
  blockSuccessMaxErrors: 3,
  practiceLevel: 1 as DifficultyLevel,
  practiceLength: 10,
  practiceTargets: 3,
  /** Pausa con el resultado en el modo sin límite antes de la letra siguiente. */
  untimedFeedbackMs: 700,
} as const;

export function paramsForLevel(level: DifficultyLevel): NBackLevelParams {
  return N_BACK_LEVELS[level - 1] ?? N_BACK_LEVELS[0];
}

export function blockLength(n: number): number {
  return N_BACK_SESSION.baseBlockLength + n;
}

export interface NBackTiming {
  /** `null` en el modo sin límite. */
  trialMs: number | null;
  stimulusMs: number | null;
}

export function timingFor(level: DifficultyLevel, mode: TimingMode): NBackTiming {
  const params = paramsForLevel(level);
  const multiplier = TIMING_MULTIPLIER[mode];
  if (multiplier === null) return { trialMs: null, stimulusMs: null };
  return {
    trialMs: Math.round(params.trialMs * multiplier),
    stimulusMs: Math.round(params.stimulusMs * multiplier),
  };
}
