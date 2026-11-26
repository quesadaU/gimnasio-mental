/**
 * Contenido de Stroop: opciones de respuesta y textos. Los parámetros por nivel viven en
 * features/patio/games/stroop/domain/params.ts.
 *
 * Tintas elegidas para contraste >= 7:1 sobre el panel oscuro del estímulo (#1c2320).
 * Rojo y verde pueden confundirse con daltonismo rojo-verde: por eso existe la variante
 * "posición", que no depende del color.
 */

import type { StroopOption, StroopVariant } from "@/features/patio/games/stroop/domain";

export const STROOP_PANEL_BG = "#1c2320";
export const STROOP_PANEL_INK = "#f3f0e8";

export const STROOP_COLOR_OPTIONS: readonly StroopOption[] = [
  { id: "rojo", label: "Rojo", keys: ["1"], keyHint: "1", ink: "#ff8a80" },
  { id: "azul", label: "Azul", keys: ["2"], keyHint: "2", ink: "#8ab4ff" },
  { id: "verde", label: "Verde", keys: ["3"], keyHint: "3", ink: "#7ee08a" },
  { id: "amarillo", label: "Amarillo", keys: ["4"], keyHint: "4", ink: "#ffe066" },
];

export const STROOP_POSITION_OPTIONS: readonly StroopOption[] = [
  { id: "arriba", label: "Arriba", keys: ["ArrowUp", "1"], keyHint: "↑" },
  { id: "abajo", label: "Abajo", keys: ["ArrowDown", "2"], keyHint: "↓" },
  { id: "izquierda", label: "Izquierda", keys: ["ArrowLeft", "3"], keyHint: "←" },
  { id: "derecha", label: "Derecha", keys: ["ArrowRight", "4"], keyHint: "→" },
];

export const STROOP_OPTIONS: Readonly<Record<StroopVariant, readonly StroopOption[]>> = {
  color: STROOP_COLOR_OPTIONS,
  posicion: STROOP_POSITION_OPTIONS,
};

export const STROOP_TEXTS = {
  intro:
    "Verás una palabra. Leerla es automático; aquí tendrás que frenar esa lectura y responder a otra cosa.",
  variants: {
    color: {
      label: "Color de la tinta",
      rule: "Responde al color en que está escrita la palabra, no a lo que dice.",
      example: "Si ves «AZUL» escrito en rojo, la respuesta es Rojo.",
    },
    posicion: {
      label: "Posición (no depende del color)",
      rule: "Responde a dónde aparece la palabra, no a lo que dice.",
      example: "Si ves «ABAJO» en la parte de arriba, la respuesta es Arriba.",
    },
  },
  honesty:
    "Practicas el control de la interferencia en esta tarea concreta. Medimos tu progreso aquí, en esta tarea; no prometemos efectos fuera de ella.",
  adaptive:
    "La dificultad se ajusta sola: con dos aciertos seguidos sube un nivel (más palabras en conflicto y menos tiempo) y con un fallo baja uno.",
  nextHint:
    "Alterna con un ejercicio de otro tipo, por ejemplo de memoria o una lectura: la práctica variada es más útil que repetir una sola tarea.",
} as const;
