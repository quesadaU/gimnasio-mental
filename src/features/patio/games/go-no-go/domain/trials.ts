/**
 * Generación de bloques, evaluación de respuestas y resumen de go/no-go. TS puro con RNG inyectado.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { GO_NO_GO_SESSION, paramsForLevel } from "./params.ts";

export type Rng = () => number;

export type TrialKind = "go" | "nogo";

export interface GoNoGoTrial {
  kind: TrialKind;
  stimulus: string;
}

export type GoNoGoOutcome =
  | "acierto"
  | "omision"
  | "anticipacion"
  | "rechazo-correcto"
  | "comision";

export interface GoNoGoRecord {
  level: DifficultyLevel;
  kind: TrialKind;
  outcome: GoNoGoOutcome;
  reactionMs?: number;
}

function randomInt(maxExclusive: number, rng: Rng): number {
  return Math.min(maxExclusive - 1, Math.floor(rng() * maxExclusive));
}

/** Número de no-go de un bloque: al menos uno para que todo bloque mida inhibición. */
export function noGoCount(level: DifficultyLevel, blockSize: number): number {
  const count = Math.round(paramsForLevel(level).noGoRatio * blockSize);
  return Math.max(1, Math.min(Math.ceil(blockSize / 2), count));
}

/**
 * Posiciones de no-go sin dos seguidas (mantiene la respuesta "go" como prepotente).
 * Se eligen k valores distintos en [0, n - k] y se separa el i-ésimo sumándole i.
 */
export function noGoPositions(blockSize: number, count: number, rng: Rng): number[] {
  const slots = Array.from({ length: blockSize - count + 1 }, (_, i) => i);
  for (let i = slots.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots
    .slice(0, count)
    .sort((a, b) => a - b)
    .map((value, index) => value + index);
}

export function generateBlock(
  level: DifficultyLevel,
  blockSize: number,
  goStimuli: readonly string[],
  noGoStimulus: string,
  rng: Rng,
): GoNoGoTrial[] {
  if (goStimuli.length === 0) throw new Error("go/no-go necesita estímulos go");
  const positions = new Set(noGoPositions(blockSize, noGoCount(level, blockSize), rng));
  return Array.from({ length: blockSize }, (_, index) =>
    positions.has(index)
      ? { kind: "nogo", stimulus: noGoStimulus }
      : { kind: "go", stimulus: goStimuli[randomInt(goStimuli.length, rng)] },
  );
}

/**
 * `responded` indica si la persona pulsó (en el modo sin límite, si eligió "pulsar").
 * `reactionMs` es null si no respondió o si el modo no mide tiempo.
 */
export function evaluate(
  trial: GoNoGoTrial,
  responded: boolean,
  reactionMs: number | null,
): GoNoGoOutcome {
  if (trial.kind === "nogo") return responded ? "comision" : "rechazo-correcto";
  if (!responded) return "omision";
  if (reactionMs !== null && reactionMs < GO_NO_GO_SESSION.anticipationMs) return "anticipacion";
  return "acierto";
}

export function isCorrect(outcome: GoNoGoOutcome): boolean {
  return outcome === "acierto" || outcome === "rechazo-correcto";
}

export function isBlockSuccess(
  block: readonly GoNoGoRecord[],
  threshold: number = GO_NO_GO_SESSION.blockSuccessAccuracy,
): boolean {
  if (block.length === 0) return false;
  const correct = block.filter((record) => isCorrect(record.outcome)).length;
  return correct / block.length >= threshold;
}

export interface GoNoGoSummary {
  trials: number;
  correct: number;
  accuracy: number;
  hits: number;
  omissions: number;
  commissions: number;
  correctRejections: number;
  meanReactionMs?: number;
  score: number;
}

export function summarize(records: readonly GoNoGoRecord[]): GoNoGoSummary {
  const count = (outcome: GoNoGoOutcome) =>
    records.filter((record) => record.outcome === outcome).length;
  const correctRecords = records.filter((record) => isCorrect(record.outcome));
  const goRts = records.flatMap((record) =>
    record.outcome === "acierto" && record.reactionMs !== undefined ? [record.reactionMs] : [],
  );
  return {
    trials: records.length,
    correct: correctRecords.length,
    accuracy: records.length === 0 ? 0 : correctRecords.length / records.length,
    hits: count("acierto"),
    omissions: count("omision") + count("anticipacion"),
    commissions: count("comision"),
    correctRejections: count("rechazo-correcto"),
    meanReactionMs:
      goRts.length === 0 ? undefined : Math.round(goRts.reduce((a, b) => a + b, 0) / goRts.length),
    score: correctRecords.reduce((sum, record) => sum + record.level, 0),
  };
}
