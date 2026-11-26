/**
 * Generación y evaluación de ensayos Stroop. TS puro: el azar llega inyectado (`Rng`), así que
 * las pruebas pueden fijar la semilla y la UI usa Math.random.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { paramsForLevel } from "./params.ts";

/** Devuelve un número en [0, 1). */
export type Rng = () => number;

/** Opción de respuesta (contenido). `ink` solo se usa en la variante de color. */
export interface StroopOption {
  id: string;
  /** Texto de la palabra y del botón. */
  label: string;
  /** Teclas que eligen esta opción (valores de KeyboardEvent.key). */
  keys: readonly string[];
  /** Pista visible de la tecla, por ejemplo "1" o "↑". */
  keyHint: string;
  /** Color de tinta (variante color) sobre el panel oscuro del estímulo. */
  ink?: string;
}

export interface StroopTrial {
  /** Lo que dice la palabra (id de opción). Es el distractor. */
  wordId: string;
  /** El rasgo al que hay que responder: color de la tinta o posición en pantalla (id de opción). */
  featureId: string;
  congruent: boolean;
}

export type StroopResponseKind = "acierto" | "error" | "sin-respuesta" | "tarde";

export interface StroopTrialRecord {
  level: DifficultyLevel;
  congruent: boolean;
  kind: StroopResponseKind;
  reactionMs?: number;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.min(items.length - 1, Math.floor(rng() * items.length))];
}

/**
 * Genera un ensayo. Evita repetir el rasgo del ensayo anterior para no mezclar el efecto Stroop
 * con la facilitación por repetición.
 */
export function generateTrial(
  optionIds: readonly string[],
  level: DifficultyLevel,
  rng: Rng,
  previous?: StroopTrial,
): StroopTrial {
  if (optionIds.length < 2) throw new Error("Stroop necesita al menos dos opciones");
  const { incongruentRatio } = paramsForLevel(level);
  const featurePool = previous
    ? optionIds.filter((id) => id !== previous.featureId)
    : optionIds;
  const featureId = pick(featurePool, rng);
  const congruent = rng() >= incongruentRatio;
  const wordId = congruent ? featureId : pick(optionIds.filter((id) => id !== featureId), rng);
  return { wordId, featureId, congruent };
}

/**
 * Evalúa una respuesta. `responseId === null` significa que se agotó el tiempo.
 * `windowMs === null` es el modo sin límite: solo cuenta la exactitud.
 */
export function evaluateResponse(
  trial: StroopTrial,
  responseId: string | null,
  reactionMs: number | null,
  windowMs: number | null,
): StroopResponseKind {
  if (responseId === null) return "sin-respuesta";
  if (responseId !== trial.featureId) return "error";
  if (windowMs !== null && reactionMs !== null && reactionMs > windowMs) return "tarde";
  return "acierto";
}
