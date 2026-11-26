import { SESSION_SCHEMA_VERSION, type DifficultyLevel, type ExerciseDefinition, type SessionOutcome, type SessionResult } from "@/core/types";

export interface SessionDraft {
  definition: ExerciseDefinition;
  startedAt: string;
  difficultyStart: DifficultyLevel;
  difficultyEnd: DifficultyLevel;
  trials: number;
  correct: number;
  outcome: SessionOutcome;
  contentId?: string;
  meanReactionMs?: number;
  /** Si no se indica: porcentaje de aciertos (0-100). */
  score?: number;
}

/** Construye un SessionResult completo (UUID de cliente, fechas ISO UTC, versión de esquema). */
export function buildSessionResult(draft: SessionDraft): SessionResult {
  const score = draft.score ?? (draft.trials > 0 ? Math.round((draft.correct / draft.trials) * 100) : 0);
  return {
    id: crypto.randomUUID(),
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: draft.definition.id,
    module: "patio",
    ...(draft.contentId ? { contentId: draft.contentId } : {}),
    startedAt: draft.startedAt,
    endedAt: new Date().toISOString(),
    outcome: draft.outcome,
    difficultyStart: draft.difficultyStart,
    difficultyEnd: draft.difficultyEnd,
    trials: draft.trials,
    correct: draft.correct,
    ...(draft.meanReactionMs !== undefined ? { meanReactionMs: Math.round(draft.meanReactionMs) } : {}),
    score: Math.max(0, Math.min(100, Math.round(score))),
  };
}

export function formatDuration(startedAt: string, endedAt: string): string {
  const seconds = Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes} min ${seconds % 60} s` : `${seconds} s`;
}
