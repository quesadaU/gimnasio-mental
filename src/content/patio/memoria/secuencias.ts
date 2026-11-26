/**
 * Textos de las tareas de amplitud. Parámetros: features/patio/games/secuencias/domain/params.ts.
 */

import type { PresentationMode, SpanVariant } from "@/features/patio/games/secuencias/domain";

export const SPAN_VARIANT_TEXTS: Readonly<
  Record<SpanVariant, { label: string; rule: string; prompt: string }>
> = {
  "digitos-directo": {
    label: "Dígitos en orden",
    rule: "Verás dígitos de uno en uno. Después, escríbelos en el mismo orden.",
    prompt: "escribe los dígitos en el mismo orden.",
  },
  "digitos-inverso": {
    label: "Dígitos al revés",
    rule: "Verás dígitos de uno en uno. Después, escríbelos empezando por el último.",
    prompt: "escribe los dígitos empezando por el último.",
  },
  espacial: {
    label: "Casillas (espacial)",
    rule: "Se iluminarán casillas de una en una. Después, tócalas en el mismo orden.",
    prompt: "toca las casillas en el mismo orden.",
  },
};

export const PRESENTATION_TEXTS: Readonly<Record<PresentationMode, { label: string; description: string }>> = {
  estandar: { label: "Estándar", description: "Un elemento por segundo." },
  ampliado: { label: "Más lento", description: "Un elemento cada segundo y medio aproximadamente." },
};

export const SPAN_TEXTS = {
  intro:
    "Este ejercicio mide cuántos elementos puedes mantener en mente a la vez y practica esa capacidad en esta tarea.",
  untimed: "Para responder no hay límite de tiempo: tómate el que necesites.",
  keysDigits: "Teclado: números 1-9, Retroceso para borrar y Intro para comprobar.",
  keysSpatial: "Teclado: flechas para moverte por la rejilla, Intro o Espacio para marcar una casilla.",
  honesty:
    "Practicas la memoria a corto plazo en esta tarea; medimos el progreso aquí, sin prometer efectos fuera de ella.",
  adaptive:
    "La longitud se ajusta sola: con dos secuencias correctas seguidas, la siguiente tiene un elemento más; con un fallo, uno menos.",
  ready: "Atención…",
  yourTurn: "Tu turno",
  erase: "Borrar",
  check: "Comprobar",
  next: "Siguiente",
  nextHint:
    "Alterna con un ejercicio de atención, una lectura o una práctica de bienestar: la práctica variada es más útil que repetir solo una tarea.",
} as const;
