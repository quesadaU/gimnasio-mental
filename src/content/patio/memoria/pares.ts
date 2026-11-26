/**
 * Símbolos del juego de parejas. Formas geométricas con nombre: se distinguen por la forma y por
 * la palabra, no por el color. "︎" fuerza la presentación de texto (no emoji) en los
 * símbolos que algunos sistemas convierten en emoji.
 * Los `id` son estables (ARQUITECTURA.md §5): no cambiarlos una vez publicados.
 */

import type { ContentPack } from "@/core/types";
import type { PairSymbol } from "@/features/patio/games/pares/domain";

export const PAIR_SYMBOLS_PACK: ContentPack<PairSymbol> = {
  id: "pares-formas",
  module: "patio",
  version: 1,
  locale: "es",
  title: "Formas geométricas",
  items: [
    { id: "circulo", glyph: "●", name: "Círculo" },
    { id: "cuadrado", glyph: "■", name: "Cuadrado" },
    { id: "triangulo", glyph: "▲", name: "Triángulo" },
    { id: "rombo", glyph: "◆", name: "Rombo" },
    { id: "estrella", glyph: "★", name: "Estrella" },
    { id: "cruz", glyph: "✚", name: "Cruz" },
    { id: "corazon", glyph: "♥︎", name: "Corazón" },
    { id: "trebol", glyph: "♣︎", name: "Trébol" },
    { id: "pica", glyph: "♠︎", name: "Pica" },
    { id: "luna", glyph: "☾", name: "Luna" },
    { id: "flor", glyph: "✿", name: "Flor" },
    { id: "hexagono", glyph: "⬢", name: "Hexágono" },
  ],
};

export const PAIRS_TEXTS = {
  intro:
    "Las cartas están boca abajo. Destapa dos cada vez: si son iguales, se quedan descubiertas; si no, se vuelven a tapar. Recuerda dónde estaba cada forma.",
  untimed:
    "En el modo sin límite, dos cartas distintas se quedan a la vista hasta que pulses «Seguir».",
  keys: "Teclado: Tab para moverte entre cartas, Intro o Espacio para destaparlas.",
  honesty:
    "Practicas recordar dónde está cada cosa en esta tarea. Medimos el progreso aquí, sin prometer efectos fuera de ella.",
  adaptive:
    "Cada ronda se valora al terminar: si fallas como mucho una vez por pareja en dos rondas seguidas, la siguiente tiene una pareja más; si fallas más, una menos.",
  continue: "Seguir",
  roundDone: "Ronda terminada",
  nextHint:
    "Alterna con un ejercicio de atención, una lectura o una práctica de bienestar: la práctica variada es más útil que repetir solo una tarea.",
} as const;
