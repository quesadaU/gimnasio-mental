/**
 * Textos comunes a los ejercicios de atención y memoria del Patio.
 * Los modos de tiempo cumplen WCAG 2.2.1 (ajustable): estándar, ampliado o sin límite.
 */

export type TimingModeId = "estandar" | "ampliado" | "sin-limite";

export interface TimingModeText {
  id: TimingModeId;
  label: string;
  description: string;
}

export const TIMING_MODE_TEXTS: readonly TimingModeText[] = [
  { id: "estandar", label: "Estándar", description: "Tiempo de respuesta habitual de la tarea." },
  { id: "ampliado", label: "Tiempo ampliado", description: "El doble de tiempo en cada ensayo." },
  {
    id: "sin-limite",
    label: "Sin límite de tiempo",
    description: "Cada ensayo espera tu respuesta. Mide solo la exactitud.",
  },
];

export const COMMON_TEXTS = {
  exit: "Salir",
  practice: "Hacer práctica",
  skipPractice: "Empezar sin práctica",
  start: "Empezar la sesión",
  practiceDoneTitle: "Práctica terminada",
  practiceDoneBody:
    "La práctica no cuenta para tu progreso. Cuando quieras, empieza la sesión: la dificultad se ajustará a cómo respondas.",
  timingLegend: "Tiempo",
  correct: "Correcto",
  wrong: "Error",
  timeout: "Tiempo agotado",
  endTitleDone: "Buen trabajo",
  levelLabel: "Nivel",
  privacy: "Tus resultados se guardan solo en este dispositivo.",
} as const;
