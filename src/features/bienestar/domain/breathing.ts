/**
 * Patrones de respiración lenta. Criterios de seguridad (por diseño, no promesas clínicas):
 * - Ritmo lento: entre 3 y 8 respiraciones por minuto (ciclo de 7,5 a 20 s). Nada de
 *   respiración rápida ni hiperventilación.
 * - Retenciones breves: como máximo 4 s; nada de apneas largas.
 * - La exhalación dura al menos lo mismo que la inhalación.
 */

import type { TimedPhase } from "./phase-timer.ts";

export type BreathPhaseKind = "inhala" | "reten" | "exhala" | "pausa";

export interface BreathPhase extends TimedPhase {
  kind: BreathPhaseKind;
}

export interface BreathingPattern {
  id: string;
  name: string;
  summary: string;
  phases: readonly BreathPhase[];
}

export const BREATH_PHASE_LABEL: Readonly<Record<BreathPhaseKind, string>> = {
  inhala: "Inhala",
  reten: "Sostén suavemente",
  exhala: "Exhala",
  pausa: "Pausa",
};

export const MAX_HOLD_SECONDS = 4;
export const MIN_BREATHS_PER_MINUTE = 3;
export const MAX_BREATHS_PER_MINUTE = 8;

export const BREATHING_PATTERNS: readonly BreathingPattern[] = [
  {
    id: "4-6",
    name: "Exhalación larga (4-6)",
    summary: "Inhala 4 segundos y exhala 6. Unas 6 respiraciones por minuto. Buena opción para empezar.",
    phases: [
      { kind: "inhala", seconds: 4 },
      { kind: "exhala", seconds: 6 },
    ],
  },
  {
    id: "cuadrada",
    name: "Respiración cuadrada (4-4-4-4)",
    summary:
      "Inhala, sostén, exhala y pausa, 4 segundos cada uno. Si sostener te resulta incómodo, vuelve al patrón 4-6.",
    phases: [
      { kind: "inhala", seconds: 4 },
      { kind: "reten", seconds: 4 },
      { kind: "exhala", seconds: 4 },
      { kind: "pausa", seconds: 4 },
    ],
  },
  {
    id: "3-5",
    name: "Suave (3-5)",
    summary: "Inhala 3 segundos y exhala 5. Más corto, por si los otros se te hacen largos.",
    phases: [
      { kind: "inhala", seconds: 3 },
      { kind: "exhala", seconds: 5 },
    ],
  },
];

export const BREATHING_DURATIONS_MIN: readonly number[] = [2, 3, 5];

export function cycleSeconds(pattern: BreathingPattern): number {
  return pattern.phases.reduce((total, phase) => total + phase.seconds, 0);
}

export function breathsPerMinute(pattern: BreathingPattern): number {
  const cycle = cycleSeconds(pattern);
  return cycle > 0 ? 60 / cycle : Infinity;
}

/** Comprueba que un patrón cumple los criterios de seguridad del módulo. */
export function isGentlePattern(pattern: BreathingPattern): boolean {
  const inhale = sumOf(pattern, "inhala");
  const exhale = sumOf(pattern, "exhala");
  const holdsOk = pattern.phases
    .filter((phase) => phase.kind === "reten" || phase.kind === "pausa")
    .every((phase) => phase.seconds <= MAX_HOLD_SECONDS);
  const rate = breathsPerMinute(pattern);
  return (
    pattern.phases.length > 0 &&
    pattern.phases.every((phase) => Number.isFinite(phase.seconds) && phase.seconds > 0) &&
    inhale > 0 &&
    exhale >= inhale &&
    holdsOk &&
    rate >= MIN_BREATHS_PER_MINUTE &&
    rate <= MAX_BREATHS_PER_MINUTE
  );
}

export function findPattern(id: string): BreathingPattern | undefined {
  return BREATHING_PATTERNS.find((pattern) => pattern.id === id);
}

function sumOf(pattern: BreathingPattern, kind: BreathPhaseKind): number {
  return pattern.phases.filter((phase) => phase.kind === kind).reduce((total, phase) => total + phase.seconds, 0);
}
