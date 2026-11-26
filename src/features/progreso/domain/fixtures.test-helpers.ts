import type { ModuleSlug, ProgressSnapshot, SessionResult } from "../../../core/types.ts";

export function session(overrides: Partial<SessionResult> & { id: string }): SessionResult {
  return {
    schemaVersion: 1,
    exerciseId: "stroop",
    module: "patio" as ModuleSlug,
    startedAt: "2026-11-20T10:00:00.000Z",
    endedAt: "2026-11-20T10:10:00.000Z",
    outcome: "completada",
    difficultyStart: 2,
    difficultyEnd: 3,
    trials: 40,
    correct: 30,
    score: 75,
    ...overrides,
  };
}

export function snapshot(overrides: Partial<ProgressSnapshot> = {}): ProgressSnapshot {
  return {
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-20T00:00:00.000Z",
    sessions: [],
    difficulty: {},
    reviewCards: {},
    ...overrides,
  };
}
