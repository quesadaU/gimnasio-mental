/**
 * Generación de secuencias, respuesta esperada y corrección. TS puro con RNG inyectado.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { DIGIT_POOL, SPATIAL_GRID_SIZE, paramsForLevel, type SpanVariant } from "./params.ts";

export type Rng = () => number;

export interface SpanRecord {
  level: DifficultyLevel;
  length: number;
  correct: boolean;
}

function randomInt(maxExclusive: number, rng: Rng): number {
  return Math.min(maxExclusive - 1, Math.floor(rng() * maxExclusive));
}

/** Tres dígitos consecutivos ascendentes o descendentes (1-2-3, 7-6-5) se agrupan sin esfuerzo. */
function makesRun(sequence: readonly number[], next: number): boolean {
  const n = sequence.length;
  if (n < 2) return false;
  const a = sequence[n - 2];
  const b = sequence[n - 1];
  return (b - a === 1 && next - b === 1) || (b - a === -1 && next - b === -1);
}

/**
 * Dígitos: sin repeticiones mientras queden dígitos sin usar, nunca dos iguales seguidos y sin
 * tramos de tres consecutivos.
 */
export function generateDigits(length: number, rng: Rng): number[] {
  // Al final de secuencias largas el único dígito libre puede romper una regla: se reintenta
  // la secuencia entera unas cuantas veces antes de relajar la regla de tramos.
  for (let attempt = 0; attempt < MAX_DIGIT_ATTEMPTS; attempt++) {
    const sequence = tryDigits(length, rng, true);
    if (sequence) return sequence;
  }
  return tryDigits(length, rng, false) ?? [];
}

const MAX_DIGIT_ATTEMPTS = 50;

function tryDigits(length: number, rng: Rng, strict: boolean): number[] | null {
  const sequence: number[] = [];
  while (sequence.length < length) {
    const unused = DIGIT_POOL.filter((digit) => !sequence.includes(digit));
    const base = unused.length > 0 ? unused : DIGIT_POOL;
    const last = sequence[sequence.length - 1];
    let pool = base.filter((digit) => digit !== last && !makesRun(sequence, digit));
    if (pool.length === 0) {
      if (strict) return null;
      pool = DIGIT_POOL.filter((digit) => digit !== last);
    }
    sequence.push(pool[randomInt(pool.length, rng)]);
  }
  return sequence;
}

/** Espacial: casillas distintas de la rejilla (0 .. size² − 1). */
export function generateCells(length: number, rng: Rng): number[] {
  const total = SPATIAL_GRID_SIZE * SPATIAL_GRID_SIZE;
  if (length > total) throw new Error("Secuencia espacial más larga que la rejilla");
  const cells = Array.from({ length: total }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, length);
}

export function generateSequence(variant: SpanVariant, level: DifficultyLevel, rng: Rng): number[] {
  const { length } = paramsForLevel(level);
  return variant === "espacial" ? generateCells(length, rng) : generateDigits(length, rng);
}

export function expectedAnswer(variant: SpanVariant, presented: readonly number[]): number[] {
  return variant === "digitos-inverso" ? [...presented].reverse() : [...presented];
}

export interface AnswerCheck {
  correct: boolean;
  /** Posiciones acertadas en su sitio (para el feedback, no para la escalera). */
  positionsCorrect: number;
}

/** Corrección estricta, como en las escalas clásicas: la secuencia completa y en orden. */
export function checkAnswer(expected: readonly number[], given: readonly number[]): AnswerCheck {
  const positionsCorrect = expected.filter((value, i) => given[i] === value).length;
  return {
    correct: given.length === expected.length && positionsCorrect === expected.length,
    positionsCorrect,
  };
}

export interface SpanSummary {
  trials: number;
  correct: number;
  /** Longitud más larga recordada correctamente. */
  longestSpan: number;
  score: number;
}

export function summarize(records: readonly SpanRecord[]): SpanSummary {
  const hits = records.filter((record) => record.correct);
  return {
    trials: records.length,
    correct: hits.length,
    longestSpan: hits.reduce((max, record) => Math.max(max, record.length), 0),
    score: hits.reduce((sum, record) => sum + record.level, 0),
  };
}
