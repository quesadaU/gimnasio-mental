/**
 * Resumen y puntuación de una sesión Stroop.
 * - Puntos: cada acierto suma tantos puntos como el nivel en que se dio (premia rendir en niveles
 *   exigentes sin castigar los errores).
 * - Efecto de interferencia: TR medio de incongruentes correctos menos TR medio de congruentes
 *   correctos. Es la medida clásica de la tarea; menor = menos coste del conflicto en esta tarea.
 */

import type { StroopTrialRecord } from "./trials.ts";

export interface StroopSummary {
  trials: number;
  correct: number;
  accuracy: number;
  meanReactionMs?: number;
  interferenceMs?: number;
  score: number;
}

function mean(values: readonly number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarize(records: readonly StroopTrialRecord[]): StroopSummary {
  const hits = records.filter((record) => record.kind === "acierto");
  const rt = (subset: readonly StroopTrialRecord[]) =>
    subset.flatMap((record) => (record.reactionMs === undefined ? [] : [record.reactionMs]));

  const meanAll = mean(rt(hits));
  const meanCongruent = mean(rt(hits.filter((record) => record.congruent)));
  const meanIncongruent = mean(rt(hits.filter((record) => !record.congruent)));

  return {
    trials: records.length,
    correct: hits.length,
    accuracy: records.length === 0 ? 0 : hits.length / records.length,
    meanReactionMs: meanAll === undefined ? undefined : Math.round(meanAll),
    interferenceMs:
      meanCongruent === undefined || meanIncongruent === undefined
        ? undefined
        : Math.round(meanIncongruent - meanCongruent),
    score: hits.reduce((sum, record) => sum + record.level, 0),
  };
}
