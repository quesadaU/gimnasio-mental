import { test } from "node:test";
import assert from "node:assert/strict";
import { PAIRS_LEVELS } from "./params.ts";
import {
  createBoard,
  flip,
  hideMismatch,
  isComplete,
  isRoundSuccess,
  summarize,
  type BoardState,
} from "./board.ts";

function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOLS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];

test("niveles: de 3 a 12 parejas, todas con símbolo disponible", () => {
  assert.deepEqual(PAIRS_LEVELS.map((p) => p.pairs), [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.ok(PAIRS_LEVELS.every((p) => p.pairs <= SYMBOLS.length));
  assert.throws(() => createBoard(13, SYMBOLS, seeded(1)));
});

test("el tablero tiene cada símbolo exactamente dos veces", () => {
  const rng = seeded(6);
  for (const { pairs } of PAIRS_LEVELS) {
    const board = createBoard(pairs, SYMBOLS, rng);
    assert.equal(board.cards.length, pairs * 2);
    const counts = new Map<string, number>();
    for (const card of board.cards) counts.set(card.symbolId, (counts.get(card.symbolId) ?? 0) + 1);
    assert.equal(counts.size, pairs);
    assert.ok([...counts.values()].every((count) => count === 2));
  }
});

function board(symbols: string[]): BoardState {
  return {
    cards: symbols.map((symbolId) => ({ symbolId, matched: false })),
    faceUp: [],
    moves: 0,
    mismatches: 0,
    matchedPairs: 0,
  };
}

test("voltear: primera, fallo, ocultar, pareja e ignoradas", () => {
  let state = board(["a", "b", "a", "b"]);
  let result = flip(state, 0);
  assert.equal(result.event, "primera");
  assert.equal(flip(result.state, 0).event, "ignorada");

  result = flip(result.state, 1);
  assert.equal(result.event, "fallo");
  assert.equal(result.state.mismatches, 1);
  assert.equal(flip(result.state, 2).event, "ignorada", "con dos cartas a la vista no se voltea otra");

  state = hideMismatch(result.state);
  assert.deepEqual(state.faceUp, []);
  state = flip(state, 0).state;
  result = flip(state, 2);
  assert.equal(result.event, "pareja");
  assert.equal(result.state.matchedPairs, 1);
  assert.equal(flip(result.state, 0).event, "ignorada", "una carta emparejada no se voltea");

  state = flip(flip(result.state, 1).state, 3).state;
  assert.equal(isComplete(state), true);
  assert.equal(state.moves, 3);
});

test("criterio de ronda y resumen", () => {
  assert.equal(isRoundSuccess(4, 4), true);
  assert.equal(isRoundSuccess(4, 5), false);
  const summary = summarize([
    { level: 1, pairs: 3, moves: 5, mismatches: 2, success: true },
    { level: 2, pairs: 4, moves: 9, mismatches: 5, success: false },
  ]);
  assert.equal(summary.moves, 14);
  assert.equal(summary.matches, 7);
  assert.equal(summary.mismatches, 7);
  assert.equal(summary.efficiency, 0.5);
  assert.equal(summary.score, 11);
});
