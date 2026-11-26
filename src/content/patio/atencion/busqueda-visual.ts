/**
 * Textos de búsqueda visual. Parámetros por nivel: features/patio/games/busqueda-visual/domain/params.ts.
 */

export const SEARCH_KEYS = {
  present: ["s", "S", "ArrowLeft"],
  absent: ["n", "N", "ArrowRight"],
} as const;

export const SEARCH_TEXTS = {
  intro:
    "Verás un conjunto de letras. Decide lo más rápido que puedas, sin precipitarte, si entre ellas hay una T (en cualquier orientación).",
  levels:
    "En los primeros niveles la T está entre círculos y salta a la vista. Después aparece entre letras L giradas, que se parecen mucho: tendrás que recorrerlas con la mirada.",
  keys: "Teclado: S o flecha izquierda = «Hay una T»; N o flecha derecha = «No hay T».",
  screenReader:
    "Este ejercicio es visual: por ahora no tiene una versión equivalente para lector de pantalla.",
  honesty:
    "Practicas la búsqueda visual y la atención selectiva en esta tarea. Medimos tu progreso aquí; no prometemos efectos fuera de ella.",
  adaptive:
    "La dificultad se ajusta sola: con dos aciertos seguidos aparecen más letras; con un fallo, menos.",
  present: "Hay una T",
  absent: "No hay T",
  feedback: {
    acierto: "Correcto",
    error: "Error",
    "sin-respuesta": "Tiempo agotado",
  },
  nextHint:
    "Alterna con un ejercicio de memoria, de lógica o con una lectura: la práctica variada es más útil que repetir una sola tarea.",
} as const;
