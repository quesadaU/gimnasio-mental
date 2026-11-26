/**
 * Tablero de parejas como máquina de estados pura: crear, voltear, ocultar fallos y resumir.
 * Sin React ni DOM; el azar llega inyectado.
 */

import type { DifficultyLevel } from "../../../../../core/types.ts";
import { PAIRS_SESSION } from "./params.ts";

export type Rng = () => number;

/** Ítem de contenido: cada símbolo tiene forma y nombre, nunca solo un color. */
export interface PairSymbol {
  id: string;
  glyph: string;
  name: string;
}

export interface PairCard {
  symbolId: string;
  matched: boolean;
}

export interface BoardState {
  cards: PairCard[];
  /** Índices boca arriba aún no emparejados (0, 1 o 2). */
  faceUp: number[];
  moves: number;
  mismatches: number;
  matchedPairs: number;
}

export type FlipEvent = "ignorada" | "primera" | "pareja" | "fallo";

export interface RoundRecord {
  level: DifficultyLevel;
  pairs: number;
  moves: number;
  mismatches: number;
  success: boolean;
}

export function createBoard(pairs: number, symbolIds: readonly string[], rng: Rng): BoardState {
  if (pairs > symbolIds.length) throw new Error("No hay símbolos suficientes para las parejas");
  const chosen = shuffle(symbolIds, rng).slice(0, pairs);
  const cards = shuffle([...chosen, ...chosen], rng).map((symbolId) => ({ symbolId, matched: false }));
  return { cards, faceUp: [], moves: 0, mismatches: 0, matchedPairs: 0 };
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function flip(state: BoardState, index: number): { state: BoardState; event: FlipEvent } {
  const card = state.cards[index];
  if (!card || card.matched || state.faceUp.includes(index) || state.faceUp.length >= 2) {
    return { state, event: "ignorada" };
  }
  if (state.faceUp.length === 0) {
    return { state: { ...state, faceUp: [index] }, event: "primera" };
  }
  const first = state.faceUp[0];
  const moves = state.moves + 1;
  if (state.cards[first].symbolId === card.symbolId) {
    const cards = state.cards.map((c, i) => (i === first || i === index ? { ...c, matched: true } : c));
    return {
      state: { ...state, cards, faceUp: [], moves, matchedPairs: state.matchedPairs + 1 },
      event: "pareja",
    };
  }
  return {
    state: { ...state, faceUp: [first, index], moves, mismatches: state.mismatches + 1 },
    event: "fallo",
  };
}

/** Vuelve a poner boca abajo las dos cartas de un fallo. */
export function hideMismatch(state: BoardState): BoardState {
  return state.faceUp.length === 2 ? { ...state, faceUp: [] } : state;
}

export function isComplete(state: BoardState): boolean {
  return state.matchedPairs * 2 === state.cards.length;
}

export function isRoundSuccess(
  pairs: number,
  mismatches: number,
  maxPerPair: number = PAIRS_SESSION.maxMismatchesPerPair,
): boolean {
  return mismatches <= pairs * maxPerPair;
}

export interface PairsSummary {
  rounds: number;
  /** Intentos (dos cartas volteadas) en total: es el `trials` de la sesión. */
  moves: number;
  /** Parejas encontradas: el `correct` de la sesión. */
  matches: number;
  mismatches: number;
  /** Parejas / intentos: 1 sería no fallar nunca. */
  efficiency: number;
  maxPairs: number;
  score: number;
}

export function summarize(rounds: readonly RoundRecord[]): PairsSummary {
  const moves = rounds.reduce((sum, round) => sum + round.moves, 0);
  const matches = rounds.reduce((sum, round) => sum + round.pairs, 0);
  return {
    rounds: rounds.length,
    moves,
    matches,
    mismatches: rounds.reduce((sum, round) => sum + round.mismatches, 0),
    efficiency: moves === 0 ? 0 : matches / moves,
    maxPairs: rounds.reduce((max, round) => Math.max(max, round.pairs), 0),
    score: rounds.reduce((sum, round) => sum + round.level * round.pairs, 0),
  };
}
