/**
 * Parámetros de la tarea Stroop (Stroop, 1935; revisión en MacLeod, 1991).
 *
 * El nivel cambia dos cosas, como fija ARQUITECTURA.md §4.1:
 * - la proporción de ensayos incongruentes (palabra y rasgo no coinciden), que son los que exigen
 *   inhibir la lectura automática;
 * - la ventana de respuesta, que obliga a resolver el conflicto más deprisa.
 * Nota: con muchos incongruentes el efecto por ensayo se reduce (Logan y Zbrodoff, 1979), pero la
 * tarea global es más exigente porque hay más ensayos de conflicto y menos tiempo.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

/** "color": nombrar el color de la tinta. "posicion": decir dónde está la palabra (Stroop espacial). */
export type StroopVariant = "color" | "posicion";

/** Modos de tiempo (WCAG 2.2.1): estándar, ampliado (x2) o sin límite. */
export type TimingMode = "estandar" | "ampliado" | "sin-limite";

export interface StroopLevelParams {
  level: DifficultyLevel;
  incongruentRatio: number;
  responseWindowMs: number;
}

export const STROOP_LEVELS: readonly StroopLevelParams[] = [
  { level: 1, incongruentRatio: 0.25, responseWindowMs: 3000 },
  { level: 2, incongruentRatio: 0.3, responseWindowMs: 2700 },
  { level: 3, incongruentRatio: 0.35, responseWindowMs: 2400 },
  { level: 4, incongruentRatio: 0.4, responseWindowMs: 2100 },
  { level: 5, incongruentRatio: 0.5, responseWindowMs: 1900 },
  { level: 6, incongruentRatio: 0.55, responseWindowMs: 1700 },
  { level: 7, incongruentRatio: 0.6, responseWindowMs: 1550 },
  { level: 8, incongruentRatio: 0.65, responseWindowMs: 1400 },
  { level: 9, incongruentRatio: 0.7, responseWindowMs: 1300 },
  { level: 10, incongruentRatio: 0.75, responseWindowMs: 1200 },
];

export const TIMING_MULTIPLIER: Readonly<Record<TimingMode, number | null>> = {
  estandar: 1,
  ampliado: 2,
  "sin-limite": null,
};

export const STROOP_SESSION = {
  trials: 60,
  practiceTrials: 6,
  practiceLevel: 1 as DifficultyLevel,
  feedbackMs: 700,
  interTrialMs: 400,
} as const;

export function paramsForLevel(level: DifficultyLevel): StroopLevelParams {
  return STROOP_LEVELS[level - 1] ?? STROOP_LEVELS[0];
}

/** Ventana efectiva según el modo; `null` significa sin límite. */
export function responseWindow(level: DifficultyLevel, mode: TimingMode): number | null {
  const multiplier = TIMING_MULTIPLIER[mode];
  return multiplier === null ? null : paramsForLevel(level).responseWindowMs * multiplier;
}
