/** Construcción de los eventos `SessionResult` del módulo de Lectura. */

import {
  SESSION_SCHEMA_VERSION,
  type DifficultyLevel,
  type ExerciseDefinition,
  type SessionOutcome,
  type SessionResult,
} from "../../../core/types.ts";
import type { ReadingLevel } from "./types.ts";

export const READING_EXERCISE_ID = "lectura-profunda";
export const REVIEW_EXERCISE_ID = "lectura-repaso";

export const LECTURA_EXERCISES: readonly ExerciseDefinition[] = [
  {
    id: READING_EXERCISE_ID,
    module: "lectura",
    kind: "lectura",
    title: "Lectura profunda",
    description:
      "Leer un texto completo sin distracciones, explicarlo con tus palabras y responder preguntas de comprensión.",
    skills: ["comprension-lectora", "atencion-sostenida", "recuperacion"],
    difficulty: { min: 3, max: 7 },
    estimatedMinutes: 10,
    adaptive: false,
  },
  {
    id: REVIEW_EXERCISE_ID,
    module: "lectura",
    kind: "lectura",
    title: "Repaso del día",
    description: "Recuperar de memoria las ideas clave de los textos leídos, con repetición espaciada.",
    skills: ["recuperacion"],
    difficulty: { min: 1, max: 1 },
    estimatedMinutes: 5,
    adaptive: false,
  },
];

const LEVEL_DIFFICULTY: Readonly<Record<ReadingLevel, DifficultyLevel>> = {
  inicial: 3,
  intermedio: 5,
  avanzado: 7,
};

export function difficultyForLevel(level: ReadingLevel): DifficultyLevel {
  return LEVEL_DIFFICULTY[level];
}

export function percentScore(correct: number, trials: number): number {
  if (trials <= 0) return 0;
  const bounded = Math.min(Math.max(correct, 0), trials);
  return Math.round((bounded / trials) * 100);
}

interface BaseSessionInput {
  id: string;
  startedAt: Date;
  endedAt: Date;
  trials: number;
  correct: number;
  outcome?: SessionOutcome;
}

function assertValid(input: BaseSessionInput): void {
  if (!input.id) throw new Error("La sesión necesita un id");
  if (input.endedAt.getTime() < input.startedAt.getTime()) {
    throw new RangeError("endedAt es anterior a startedAt");
  }
  if (!Number.isInteger(input.trials) || input.trials < 0) throw new RangeError("trials inválido");
  if (!Number.isInteger(input.correct) || input.correct < 0 || input.correct > input.trials) {
    throw new RangeError("correct inválido");
  }
}

export function buildReadingSession(
  input: BaseSessionInput & { textId: string; level: ReadingLevel },
): SessionResult {
  assertValid(input);
  const difficulty = difficultyForLevel(input.level);
  return {
    id: input.id,
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: READING_EXERCISE_ID,
    module: "lectura",
    contentId: input.textId,
    startedAt: input.startedAt.toISOString(),
    endedAt: input.endedAt.toISOString(),
    outcome: input.outcome ?? "completada",
    difficultyStart: difficulty,
    difficultyEnd: difficulty,
    trials: input.trials,
    correct: input.correct,
    score: percentScore(input.correct, input.trials),
  };
}

export function buildReviewSession(input: BaseSessionInput): SessionResult {
  assertValid(input);
  return {
    id: input.id,
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: REVIEW_EXERCISE_ID,
    module: "lectura",
    startedAt: input.startedAt.toISOString(),
    endedAt: input.endedAt.toISOString(),
    outcome: input.outcome ?? "completada",
    difficultyStart: 1,
    difficultyEnd: 1,
    trials: input.trials,
    correct: input.correct,
    score: percentScore(input.correct, input.trials),
  };
}
