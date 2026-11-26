/**
 * Ciclo de una lección y construcción del evento de fin de sesión. Puro: la UI inyecta
 * el id (crypto.randomUUID) y las fechas (new Date().toISOString()).
 */

import { SESSION_SCHEMA_VERSION } from "../../../core/types.ts";
import type { DifficultyLevel, IsoDateTime, SessionOutcome, SessionResult } from "../../../core/types.ts";
import type { RutaSlug } from "./types.ts";

export const MODULO = "habilidades" as const;
export const MAX_PISTAS = 3;

/** Fases del ciclo de aprendizaje de una lección, en orden. */
export const FASES = ["explicacion", "intento", "ejercicios", "recuperacion", "resumen"] as const;
export type Fase = (typeof FASES)[number];

export function siguienteFase(fase: Fase): Fase {
  const indice = FASES.indexOf(fase);
  return FASES[Math.min(indice + 1, FASES.length - 1)];
}

export interface EstadoIntento {
  pistasVistas: number;
  intentado: boolean;
}

export function verPista(estado: EstadoIntento): EstadoIntento {
  return { ...estado, pistasVistas: Math.min(estado.pistasVistas + 1, MAX_PISTAS) };
}

/** La solución explicada solo se desbloquea tras un intento propio o tras agotar las 3 pistas. */
export function puedeVerSolucion(estado: EstadoIntento): boolean {
  return estado.intentado || estado.pistasVistas >= MAX_PISTAS;
}

export function deckIdDeRuta(ruta: RutaSlug): string {
  return `${MODULO}:${ruta}`;
}

export function exerciseIdDeLeccion(ruta: RutaSlug, leccionId: string): string {
  return `${MODULO}:${ruta}:${leccionId}`;
}

export const EXERCISE_ID_REPASO = `${MODULO}:repaso`;

/** Puntuación 0-100 redondeada; 0 si no hubo ensayos. */
export function puntuacion(correctos: number, ensayos: number): number {
  if (ensayos <= 0) return 0;
  return Math.round((Math.min(correctos, ensayos) / ensayos) * 100);
}

export interface DatosSesion {
  id: string;
  exerciseId: string;
  contentId: string;
  startedAt: IsoDateTime;
  endedAt: IsoDateTime;
  trials: number;
  correct: number;
  nivel: DifficultyLevel;
  outcome?: SessionOutcome;
}

export function construirSessionResult(datos: DatosSesion): SessionResult {
  const trials = Math.max(0, Math.floor(datos.trials));
  const correct = Math.max(0, Math.min(Math.floor(datos.correct), trials));
  return {
    id: datos.id,
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: datos.exerciseId,
    module: MODULO,
    contentId: datos.contentId,
    startedAt: datos.startedAt,
    endedAt: datos.endedAt,
    outcome: datos.outcome ?? "completada",
    difficultyStart: datos.nivel,
    difficultyEnd: datos.nivel,
    trials,
    correct,
    score: puntuacion(correct, trials),
  };
}

/**
 * Registro de aciertos de una sesión: cuenta solo el primer intento de cada ítem
 * (los reintentos sirven para aprender, no para inflar la puntuación).
 */
export interface Marcador {
  primerIntento: Readonly<Record<string, boolean>>;
}

export const marcadorVacio: Marcador = { primerIntento: {} };

export function registrarIntento(marcador: Marcador, itemId: string, correcto: boolean): Marcador {
  if (Object.prototype.hasOwnProperty.call(marcador.primerIntento, itemId)) return marcador;
  return { primerIntento: { ...marcador.primerIntento, [itemId]: correcto } };
}

export function resumenMarcador(marcador: Marcador): { trials: number; correct: number } {
  const valores = Object.values(marcador.primerIntento);
  return { trials: valores.length, correct: valores.filter(Boolean).length };
}
