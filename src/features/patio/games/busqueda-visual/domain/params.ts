/**
 * Parámetros de búsqueda visual con juicio presente/ausente (Treisman y Gelade, 1980; Wolfe, 1998).
 *
 * El nivel cambia (ARQUITECTURA.md §4.1) el número de distractores y su tipo:
 * - "rasgo": la T entre círculos destaca sola (búsqueda en paralelo, casi sin coste por elemento);
 * - "configuracion": la T entre L rotadas comparte trazos con los distractores y obliga a revisar
 *   los elementos uno a uno (búsqueda serial, ~20-40 ms por elemento).
 * La ventana de respuesta es generosa: aquí el reto es la exactitud bajo carga, no la prisa.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";

export type TimingMode = "estandar" | "ampliado" | "sin-limite";
export type DistractorKind = "rasgo" | "configuracion";

export interface SearchLevelParams {
  level: DifficultyLevel;
  setSize: number;
  distractorKind: DistractorKind;
  responseWindowMs: number;
}

export const SEARCH_LEVELS: readonly SearchLevelParams[] = [
  { level: 1, setSize: 6, distractorKind: "rasgo", responseWindowMs: 5000 },
  { level: 2, setSize: 12, distractorKind: "rasgo", responseWindowMs: 5000 },
  { level: 3, setSize: 8, distractorKind: "configuracion", responseWindowMs: 6000 },
  { level: 4, setSize: 12, distractorKind: "configuracion", responseWindowMs: 6000 },
  { level: 5, setSize: 16, distractorKind: "configuracion", responseWindowMs: 6000 },
  { level: 6, setSize: 20, distractorKind: "configuracion", responseWindowMs: 6000 },
  { level: 7, setSize: 24, distractorKind: "configuracion", responseWindowMs: 6000 },
  { level: 8, setSize: 28, distractorKind: "configuracion", responseWindowMs: 5500 },
  { level: 9, setSize: 34, distractorKind: "configuracion", responseWindowMs: 5500 },
  { level: 10, setSize: 40, distractorKind: "configuracion", responseWindowMs: 5500 },
];

export const TIMING_MULTIPLIER: Readonly<Record<TimingMode, number | null>> = {
  estandar: 1,
  ampliado: 2,
  "sin-limite": null,
};

/** Rejilla donde se colocan los elementos (columnas x filas >= setSize máximo). */
export const SEARCH_GRID = { columns: 7, rows: 6, maxJitter: 0.22 } as const;

export const SEARCH_SESSION = {
  trials: 40,
  practiceTrials: 4,
  practiceLevel: 1 as DifficultyLevel,
  targetPresentRatio: 0.5,
  fixationMs: 500,
  feedbackMs: 800,
} as const;

export function paramsForLevel(level: DifficultyLevel): SearchLevelParams {
  return SEARCH_LEVELS[level - 1] ?? SEARCH_LEVELS[0];
}

export function responseWindow(level: DifficultyLevel, mode: TimingMode): number | null {
  const multiplier = TIMING_MULTIPLIER[mode];
  return multiplier === null ? null : paramsForLevel(level).responseWindowMs * multiplier;
}
