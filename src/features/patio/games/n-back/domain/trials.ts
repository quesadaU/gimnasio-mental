/**
 * Generación de bloques n-back con número exacto de coincidencias y señuelos opcionales,
 * evaluación por ensayo y resumen de la sesión. TS puro con RNG inyectado.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { N_BACK_SESSION } from "./params.ts";

export type Rng = () => number;

export interface NBackTrial {
  letter: string;
  isTarget: boolean;
  isLure: boolean;
}

export type NBackOutcome = "acierto" | "omision" | "falsa-alarma" | "rechazo-correcto";

export interface NBackRecord {
  level: DifficultyLevel;
  n: number;
  outcome: NBackOutcome;
  reactionMs?: number;
}

export interface BlockSpec {
  n: number;
  length: number;
  targets: number;
  lures: number;
}

function randomInt(maxExclusive: number, rng: Rng): number {
  return Math.min(maxExclusive - 1, Math.floor(rng() * maxExclusive));
}

function sample<T>(items: readonly T[], count: number, rng: Rng): T[] {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, count));
}

/**
 * Construye la secuencia de izquierda a derecha. Las coincidencias copian la letra de n atrás;
 * los demás ensayos nunca la repiten, así que el número de coincidencias es exacto.
 */
export function generateBlock(spec: BlockSpec, letters: readonly string[], rng: Rng): NBackTrial[] {
  const { n, length } = spec;
  if (letters.length < 3) throw new Error("n-back necesita al menos tres letras");
  if (n < 1 || length <= n) throw new Error("Bloque n-back inválido");

  const eligible = Array.from({ length: length - n }, (_, i) => i + n);
  const targets = new Set(sample(eligible, Math.min(spec.targets, eligible.length), rng));
  const lureCandidates = eligible.filter((i) => !targets.has(i) && i >= n + 1);
  const lures = new Set(sample(lureCandidates, spec.lures, rng));

  const sequence: string[] = [];
  const lureFlags: boolean[] = [];
  for (let i = 0; i < length; i++) {
    const nBack = i >= n ? sequence[i - n] : undefined;
    if (targets.has(i) && nBack !== undefined) {
      sequence.push(nBack);
      lureFlags.push(false);
      continue;
    }
    if (lures.has(i)) {
      const offsets = [n + 1, ...(n >= 2 ? [n - 1] : [])].filter((offset) => i - offset >= 0);
      const options = offsets.map((offset) => sequence[i - offset]).filter((letter) => letter !== nBack);
      if (options.length > 0) {
        sequence.push(options[randomInt(options.length, rng)]);
        lureFlags.push(true);
        continue;
      }
    }
    const pool = letters.filter((letter) => letter !== nBack);
    sequence.push(pool[randomInt(pool.length, rng)]);
    lureFlags.push(false);
  }

  return sequence.map((letter, i) => ({
    letter,
    isTarget: i >= n && sequence[i - n] === letter,
    isLure: lureFlags[i],
  }));
}

export function evaluate(trial: NBackTrial, responded: boolean): NBackOutcome {
  if (trial.isTarget) return responded ? "acierto" : "omision";
  return responded ? "falsa-alarma" : "rechazo-correcto";
}

export function isCorrect(outcome: NBackOutcome): boolean {
  return outcome === "acierto" || outcome === "rechazo-correcto";
}

export function blockErrors(records: readonly NBackRecord[]): number {
  return records.filter((record) => !isCorrect(record.outcome)).length;
}

export function isBlockSuccess(
  records: readonly NBackRecord[],
  maxErrors: number = N_BACK_SESSION.blockSuccessMaxErrors,
): boolean {
  return records.length > 0 && blockErrors(records) <= maxErrors;
}

export interface NBackSummary {
  trials: number;
  correct: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  /** Índice de discriminación Pr = tasa de aciertos − tasa de falsas alarmas (Snodgrass y Corwin, 1988). */
  discrimination: number;
  maxN: number;
  meanReactionMs?: number;
  score: number;
}

export function summarize(records: readonly NBackRecord[]): NBackSummary {
  const count = (outcome: NBackOutcome) =>
    records.filter((record) => record.outcome === outcome).length;
  const hits = count("acierto");
  const misses = count("omision");
  const falseAlarms = count("falsa-alarma");
  const correctRejections = count("rechazo-correcto");
  const hitRate = hits + misses === 0 ? 0 : hits / (hits + misses);
  const faRate = falseAlarms + correctRejections === 0 ? 0 : falseAlarms / (falseAlarms + correctRejections);
  const rts = records.flatMap((record) =>
    record.outcome === "acierto" && record.reactionMs !== undefined ? [record.reactionMs] : [],
  );
  const correctRecords = records.filter((record) => isCorrect(record.outcome));
  return {
    trials: records.length,
    correct: correctRecords.length,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    discrimination: hitRate - faRate,
    maxN: records.reduce((max, record) => Math.max(max, record.n), 0),
    meanReactionMs: rts.length === 0 ? undefined : Math.round(rts.reduce((a, b) => a + b, 0) / rts.length),
    score: correctRecords.reduce((sum, record) => sum + record.level, 0),
  };
}
