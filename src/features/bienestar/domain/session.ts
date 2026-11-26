/**
 * Resultado de sesión de una práctica de bienestar. Solo registra que la práctica se hizo y
 * cuánto duró (startedAt/endedAt). Nunca codifica el estado emocional: `score` es siempre 0.
 */

import { SESSION_SCHEMA_VERSION } from "../../../core/types.ts";
import type { SessionResult } from "../../../core/types.ts";

export interface PracticeSessionInput {
  id: string;
  exerciseId: string;
  contentId?: string;
  startedAt: Date;
  endedAt: Date;
  completed: boolean;
}

export function buildPracticeSession(input: PracticeSessionInput): SessionResult {
  const endedAt = input.endedAt.getTime() < input.startedAt.getTime() ? input.startedAt : input.endedAt;
  const result: SessionResult = {
    id: input.id,
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: input.exerciseId,
    module: "bienestar",
    startedAt: input.startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    outcome: input.completed ? "completada" : "abandonada",
    difficultyStart: 1,
    difficultyEnd: 1,
    trials: 1,
    correct: input.completed ? 1 : 0,
    score: 0,
  };
  if (input.contentId) result.contentId = input.contentId;
  return result;
}

export function sessionDurationMs(result: Pick<SessionResult, "startedAt" | "endedAt">): number {
  return Math.max(0, Date.parse(result.endedAt) - Date.parse(result.startedAt));
}
