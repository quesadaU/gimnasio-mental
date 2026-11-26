import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  applyUciLine,
  findUciMove,
  isCheckmate,
  materialBalance,
  matingMoves,
  moveToUci,
  parseFen,
} from "./chess.ts";
import { mateDepth, type ChessPuzzle } from "./puzzles.ts";

const PACK_URL = new URL("../../../../../content/patio/ajedrez/tacticas-basicas.json", import.meta.url);
const pack = JSON.parse(readFileSync(PACK_URL, "utf8")) as { id: string; items: ChessPuzzle[] };

describe(`paquete ${pack.id}`, () => {
  it("tiene al menos 40 puzzles con ids únicos y ratings en rango", () => {
    assert.ok(pack.items.length >= 40, `solo hay ${pack.items.length}`);
    const ids = new Set(pack.items.map((p) => p.id));
    assert.equal(ids.size, pack.items.length);
    for (const p of pack.items) assert.ok(p.rating >= 600 && p.rating <= 1800, p.id);
  });

  for (const puzzle of pack.items) {
    it(`${puzzle.id}: solución legal y coherente con el tema`, () => {
      const start = parseFen(puzzle.fen);
      assert.equal(puzzle.solution.length % 2, 1, "la línea debe terminar con jugada del usuario");
      const end = applyUciLine(start, puzzle.solution);

      for (const alternative of puzzle.alternatives ?? []) applyUciLine(start, alternative);

      const depth = mateDepth(puzzle.theme);
      if (depth !== undefined) {
        assert.equal(puzzle.solution.length, depth * 2 - 1);
        assert.ok(isCheckmate(end), "la línea debe terminar en mate");
        for (const alternative of puzzle.alternatives ?? []) {
          assert.ok(isCheckmate(applyUciLine(start, alternative)), "alternativa sin mate");
        }
        if (depth === 2) {
          assert.equal(matingMoves(start, 1).length, 0, "no debe haber mate en 1");
          const firstMoves = matingMoves(start, 2).map(moveToUci);
          assert.ok(firstMoves.includes(puzzle.solution[0]), "la primera jugada debe forzar mate en 2");
        }
      } else {
        const gain = materialBalance(end, start.turn) - materialBalance(start, start.turn);
        assert.ok(gain >= 2, `la línea solo gana ${gain} de material`);
      }
      assert.ok(findUciMove(start, puzzle.solution[0]));
    });
  }
});
