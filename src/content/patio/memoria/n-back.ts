/**
 * Contenido de n-back. Consonantes del estudio de Jaeggi et al. (2008), poco confundibles entre sí
 * a la vista y al oído. Parámetros por nivel: features/patio/games/n-back/domain/params.ts.
 */

export const N_BACK_LETTERS: readonly string[] = ["C", "H", "K", "L", "Q", "R", "S", "T"];

export const N_BACK_KEYS = {
  match: [" ", "j", "J"],
  noMatch: ["f", "F"],
} as const;

export function nBackRule(n: number): string {
  return n === 1
    ? "Pulsa «Coincide» cuando la letra sea igual a la inmediatamente anterior."
    : `Pulsa «Coincide» cuando la letra sea igual a la de hace ${n} letras.`;
}

export const N_BACK_TEXTS = {
  intro:
    "Verás una letra cada pocos segundos. Tienes que ir recordando las últimas y avisar cuando una se repite a cierta distancia (n).",
  example:
    "Ejemplo con n = 2: en «K, R, K» la segunda K coincide, porque es igual a la de dos letras antes.",
  untimed:
    "En el modo sin límite cada letra espera: elige «Coincide» o «No coincide».",
  keys: "Teclado: barra espaciadora o J para «Coincide»; en el modo sin límite, F para «No coincide».",
  honesty:
    "Practicas la memoria de trabajo en esta tarea. La investigación muestra mejoras en la tarea entrenada y poca transferencia a otras capacidades; medimos tu progreso aquí.",
  adaptive:
    "Al final de cada bloque se ajusta la dificultad: con dos bloques seguidos de 3 errores o menos sube un nivel (n mayor o ritmo más rápido); con un bloque de más errores, baja.",
  match: "Coincide",
  noMatch: "No coincide",
  feedback: {
    acierto: "Coincidencia detectada",
    "falsa-alarma": "No coincidía",
    omision: "Había una coincidencia",
    "rechazo-correcto": "Bien, no coincidía",
  },
  pauseTitle: "Fin del bloque",
  nextHint:
    "Alterna con un ejercicio de atención, una lectura o una práctica de bienestar: la variedad es más útil que repetir un solo juego.",
} as const;
