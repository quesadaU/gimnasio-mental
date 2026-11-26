/**
 * Generación de pantallas de búsqueda, evaluación y resumen. TS puro con RNG inyectado.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { SEARCH_GRID, SEARCH_SESSION, paramsForLevel } from "./params.ts";

export type Rng = () => number;
export type Glyph = "T" | "L" | "O";
export type Rotation = 0 | 90 | 180 | 270;

export interface SearchItem {
  /** Índice de celda en la rejilla (fila * columnas + columna). */
  cell: number;
  glyph: Glyph;
  rotation: Rotation;
  isTarget: boolean;
  /** Desplazamiento dentro de la celda, en fracción de celda, para romper la regularidad. */
  jitterX: number;
  jitterY: number;
}

export interface SearchDisplay {
  items: SearchItem[];
  targetPresent: boolean;
}

export type SearchAnswer = "presente" | "ausente";
export type SearchOutcome = "acierto" | "error" | "sin-respuesta";

export interface SearchRecord {
  level: DifficultyLevel;
  setSize: number;
  targetPresent: boolean;
  outcome: SearchOutcome;
  reactionMs?: number;
}

const ROTATIONS: readonly Rotation[] = [0, 90, 180, 270];

function randomInt(maxExclusive: number, rng: Rng): number {
  return Math.min(maxExclusive - 1, Math.floor(rng() * maxExclusive));
}

function jitter(rng: Rng): number {
  return (rng() * 2 - 1) * SEARCH_GRID.maxJitter;
}

export function generateDisplay(
  level: DifficultyLevel,
  rng: Rng,
  targetPresent: boolean = rng() < SEARCH_SESSION.targetPresentRatio,
): SearchDisplay {
  const { setSize, distractorKind } = paramsForLevel(level);
  const totalCells = SEARCH_GRID.columns * SEARCH_GRID.rows;
  const size = Math.min(setSize, totalCells);

  const cells = Array.from({ length: totalCells }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  const targetSlot = targetPresent ? randomInt(size, rng) : -1;
  const items = cells.slice(0, size).map((cell, slot): SearchItem => {
    const isTarget = slot === targetSlot;
    const glyph: Glyph = isTarget ? "T" : distractorKind === "rasgo" ? "O" : "L";
    return {
      cell,
      glyph,
      rotation: glyph === "O" ? 0 : ROTATIONS[randomInt(ROTATIONS.length, rng)],
      isTarget,
      jitterX: jitter(rng),
      jitterY: jitter(rng),
    };
  });
  return { items, targetPresent };
}

export function evaluate(display: SearchDisplay, answer: SearchAnswer | null): SearchOutcome {
  if (answer === null) return "sin-respuesta";
  return (answer === "presente") === display.targetPresent ? "acierto" : "error";
}

export interface SearchSummary {
  trials: number;
  correct: number;
  accuracy: number;
  meanReactionMs?: number;
  meanPresentMs?: number;
  meanAbsentMs?: number;
  maxSetSize: number;
  score: number;
}

function meanRt(records: readonly SearchRecord[]): number | undefined {
  const values = records.flatMap((record) =>
    record.outcome === "acierto" && record.reactionMs !== undefined ? [record.reactionMs] : [],
  );
  if (values.length === 0) return undefined;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function summarize(records: readonly SearchRecord[]): SearchSummary {
  const hits = records.filter((record) => record.outcome === "acierto");
  return {
    trials: records.length,
    correct: hits.length,
    accuracy: records.length === 0 ? 0 : hits.length / records.length,
    meanReactionMs: meanRt(records),
    meanPresentMs: meanRt(records.filter((record) => record.targetPresent)),
    meanAbsentMs: meanRt(records.filter((record) => !record.targetPresent)),
    maxSetSize: records.reduce((max, record) => Math.max(max, record.setSize), 0),
    score: hits.reduce((sum, record) => sum + record.level, 0),
  };
}
