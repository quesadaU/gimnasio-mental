import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyMove, findUciMove, moveToUci, parseFen, type Move, type Position } from "./chess.ts";
import {
  judgeMove,
  opponentReply,
  pickPuzzle,
  ratingForLevel,
  solutionMoveAt,
  type ChessPuzzle,
} from "./puzzles.ts";

const backRank: ChessPuzzle = {
  id: "t-1",
  fen: "6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1",
  solution: ["a1a8"],
  theme: "mate-en-1",
  rating: 600,
};

const ladder: ChessPuzzle = {
  id: "t-2",
  fen: "7k/8/8/8/8/8/R7/1R4K1 w - - 0 1",
  solution: ["b1b7", "h8g8", "a2a8"],
  theme: "mate-en-2",
  rating: 1100,
};

const fork: ChessPuzzle = {
  id: "t-3",
  fen: "r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
  solution: ["d5c7", "e8d7", "c7a8"],
  theme: "horquilla",
  rating: 800,
};

describe("judgeMove", () => {
  it("distingue jugada ilegal, incorrecta y correcta", () => {
    const start = parseFen(backRank.fen);
    assert.equal(judgeMove(backRank, start, [], "a1a9").kind, "ilegal");
    assert.equal(judgeMove(backRank, start, [], "a1a7").kind, "incorrecta");
    const verdict = judgeMove(backRank, start, [], "a1a8");
    assert.equal(verdict.kind, "correcta");
    assert.ok(verdict.kind === "correcta" && verdict.finished);
  });

  it("en mate en 2 acepta cualquier primera jugada que mantenga el mate forzado", () => {
    const start = parseFen(ladder.fen);
    const alternative = judgeMove(ladder, start, [], "a2a7");
    assert.equal(alternative.kind, "correcta");
    assert.ok(alternative.kind === "correcta" && !alternative.finished);
    assert.equal(judgeMove(ladder, start, [], "b1b8").kind, "incorrecta", "Tb8+ no fuerza mate en 2");
  });

  it("la respuesta del rival sigue el guion y, fuera de él, elige una defensa legal", () => {
    const start = parseFen(ladder.fen);
    const scripted = opponentReply(ladder, applyMove(start, parseMove(start, "b1b7")), ["b1b7"]);
    assert.equal(scripted && moveToUci(scripted), "h8g8");
    const offScript = opponentReply(ladder, applyMove(start, parseMove(start, "a2a7")), ["a2a7"]);
    assert.ok(offScript);
  });

  it("en tácticas exige la línea exacta", () => {
    const start = parseFen(fork.fen);
    assert.equal(judgeMove(fork, start, [], "d5b6").kind, "incorrecta");
    const first = judgeMove(fork, start, [], "d5c7");
    assert.ok(first.kind === "correcta" && !first.finished);
    assert.equal(solutionMoveAt(fork, ["d5c7", "e8d7"]), "c7a8");
  });
});

describe("selección por nivel", () => {
  it("convierte nivel en rating y elige el puzzle más cercano no usado", () => {
    assert.equal(ratingForLevel(1), 600);
    assert.equal(ratingForLevel(5), 1100);
    const all = [backRank, ladder, fork];
    assert.equal(pickPuzzle(all, 5, new Set())?.id, "t-2");
    assert.equal(pickPuzzle(all, 5, new Set(["t-2"]))?.id, "t-3");
    assert.equal(pickPuzzle(all, 1, new Set(["t-1", "t-2", "t-3"])), undefined);
  });
});

function parseMove(position: Position, uci: string): Move {
  const move = findUciMove(position, uci);
  assert.ok(move, `jugada ilegal ${uci}`);
  return move;
}
