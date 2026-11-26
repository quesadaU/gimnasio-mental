/**
 * Parámetros de go/no-go (Donders, 1868; revisión de diseño en Wessel, 2018).
 *
 * El nivel cambia (ARQUITECTURA.md §4.1):
 * - la proporción de no-go: cuanto más raros, más automática se vuelve la respuesta "go" y más
 *   cuesta frenarla (Wessel, 2018, recomienda no-go infrecuentes para medir inhibición);
 * - el ritmo: menos tiempo de estímulo y menor intervalo entre estímulos (ISI).
 * La escalera se aplica por bloques de 10 ensayos (un bloque "acierta" con >= 90 % correcto),
 * porque los ensayos go son casi siempre correctos y una escalera por ensayo subiría sin medir
 * la inhibición.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

export type TimingMode = "estandar" | "ampliado" | "sin-limite";

export interface GoNoGoLevelParams {
  level: DifficultyLevel;
  noGoRatio: number;
  /** Tiempo visible del estímulo y ventana de respuesta. */
  stimulusMs: number;
  /** Intervalo en blanco entre estímulos (aquí se muestra el feedback). */
  isiMs: number;
}

export const GO_NO_GO_LEVELS: readonly GoNoGoLevelParams[] = [
  { level: 1, noGoRatio: 0.3, stimulusMs: 1000, isiMs: 1200 },
  { level: 2, noGoRatio: 0.3, stimulusMs: 900, isiMs: 1100 },
  { level: 3, noGoRatio: 0.25, stimulusMs: 850, isiMs: 1000 },
  { level: 4, noGoRatio: 0.25, stimulusMs: 750, isiMs: 950 },
  { level: 5, noGoRatio: 0.2, stimulusMs: 700, isiMs: 900 },
  { level: 6, noGoRatio: 0.2, stimulusMs: 650, isiMs: 850 },
  { level: 7, noGoRatio: 0.2, stimulusMs: 600, isiMs: 800 },
  { level: 8, noGoRatio: 0.2, stimulusMs: 550, isiMs: 750 },
  { level: 9, noGoRatio: 0.1, stimulusMs: 500, isiMs: 700 },
  { level: 10, noGoRatio: 0.1, stimulusMs: 450, isiMs: 650 },
];

export const TIMING_MULTIPLIER: Readonly<Record<TimingMode, number | null>> = {
  estandar: 1,
  ampliado: 2,
  "sin-limite": null,
};

export const GO_NO_GO_SESSION = {
  blockSize: 10,
  blocks: 10,
  /** Proporción mínima de ensayos correctos para que el bloque cuente como acierto. */
  blockSuccessAccuracy: 0.9,
  practiceTrials: 8,
  practiceLevel: 1 as DifficultyLevel,
  /** Respuestas más rápidas no pueden basarse en el estímulo: se cuentan como anticipación. */
  anticipationMs: 150,
  /** ISI fijo del modo sin límite (no es tiempo de respuesta, solo una pausa entre estímulos). */
  untimedIsiMs: 800,
} as const;

export function paramsForLevel(level: DifficultyLevel): GoNoGoLevelParams {
  return GO_NO_GO_LEVELS[level - 1] ?? GO_NO_GO_LEVELS[0];
}

export interface GoNoGoTiming {
  /** `null` en el modo sin límite: el estímulo espera la respuesta. */
  stimulusMs: number | null;
  isiMs: number;
}

export function timingFor(level: DifficultyLevel, mode: TimingMode): GoNoGoTiming {
  const params = paramsForLevel(level);
  const multiplier = TIMING_MULTIPLIER[mode];
  if (multiplier === null) return { stimulusMs: null, isiMs: GO_NO_GO_SESSION.untimedIsiMs };
  return { stimulusMs: params.stimulusMs * multiplier, isiMs: params.isiMs * multiplier };
}
