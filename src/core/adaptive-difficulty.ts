/**
 * Escalera adaptativa 2-arriba/1-abajo (Levitt, 1971): dos aciertos seguidos suben un nivel,
 * un fallo baja uno. Converge hacia ~71 % de aciertos, una zona exigente pero alcanzable.
 */

import {
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  type DifficultyLevel,
  type DifficultyRange,
} from "./types";

export interface StaircaseConfig {
  range: DifficultyRange;
  correctToLevelUp: number;
}

export type StaircaseDirection = "subida" | "bajada" | "ninguna";

export interface StaircaseState {
  level: DifficultyLevel;
  consecutiveCorrect: number;
  lastDirection: StaircaseDirection;
  reversals: number;
}

export const DEFAULT_STAIRCASE: StaircaseConfig = {
  range: { min: MIN_DIFFICULTY, max: MAX_DIFFICULTY },
  correctToLevelUp: 2,
};

export function clampDifficulty(value: number, range: DifficultyRange): DifficultyLevel {
  const rounded = Math.round(Number.isFinite(value) ? value : range.min);
  return Math.min(range.max, Math.max(range.min, rounded)) as DifficultyLevel;
}

export function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_DIFFICULTY &&
    value <= MAX_DIFFICULTY
  );
}

/** Nivel inicial de una sesión: un escalón por debajo del último nivel como calentamiento. */
export function startingLevel(
  lastLevel: DifficultyLevel | undefined,
  config: StaircaseConfig = DEFAULT_STAIRCASE,
): DifficultyLevel {
  if (lastLevel === undefined) return config.range.min;
  return clampDifficulty(lastLevel - 1, config.range);
}

export function createStaircase(
  level: DifficultyLevel,
  config: StaircaseConfig = DEFAULT_STAIRCASE,
): StaircaseState {
  return {
    level: clampDifficulty(level, config.range),
    consecutiveCorrect: 0,
    lastDirection: "ninguna",
    reversals: 0,
  };
}

export function nextStaircase(
  state: StaircaseState,
  correct: boolean,
  config: StaircaseConfig = DEFAULT_STAIRCASE,
): StaircaseState {
  if (correct) {
    const streak = state.consecutiveCorrect + 1;
    if (streak < config.correctToLevelUp) {
      return { ...state, consecutiveCorrect: streak };
    }
    return move(state, "subida", config);
  }
  return move(state, "bajada", config);
}

function move(
  state: StaircaseState,
  direction: Exclude<StaircaseDirection, "ninguna">,
  config: StaircaseConfig,
): StaircaseState {
  const delta = direction === "subida" ? 1 : -1;
  const level = clampDifficulty(state.level + delta, config.range);
  const isReversal = state.lastDirection !== "ninguna" && state.lastDirection !== direction;
  return {
    level,
    consecutiveCorrect: 0,
    lastDirection: direction,
    reversals: state.reversals + (isReversal ? 1 : 0),
  };
}
