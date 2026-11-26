import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  allAssignments,
  clueHolds,
  clueText,
  countCompatible,
  countMistakes,
  emptyAnswer,
  generateLogicPuzzle,
  levelSpec,
  permutations,
  type LogicPuzzle,
} from "./logic-puzzle.ts";
import { seededRandom } from "../../sudoku/domain/sudoku.ts";

describe("combinatoria", () => {
  it("genera n! permutaciones distintas", () => {
    const perms = permutations(4);
    assert.equal(perms.length, 24);
    assert.equal(new Set(perms.map((p) => p.join())).size, 24);
    assert.equal(allAssignments(3, 2).length, 36);
  });
});

describe("pistas", () => {
  const puzzle: LogicPuzzle = {
    level: 1,
    people: ["Ana", "Luis", "Marta"],
    categories: [
      { id: "casa", label: "Casa", values: ["casa 1", "casa 2", "casa 3"] },
      { id: "mascota", label: "Mascota", values: ["gato", "perro", "pez"] },
    ],
    // Ana: casa 2 + perro; Luis: casa 1 + pez; Marta: casa 3 + gato
    solution: [
      [1, 0, 2],
      [1, 2, 0],
    ],
    clues: [],
  };

  it("evalúa cada tipo de pista sobre una asignación", () => {
    const s = puzzle.solution;
    assert.ok(clueHolds({ kind: "mismo", a: { category: -1, value: 0 }, b: { category: 1, value: 1 } }, s));
    assert.ok(clueHolds({ kind: "distinto", a: { category: -1, value: 0 }, b: { category: 1, value: 0 } }, s));
    assert.ok(clueHolds({ kind: "izquierda", a: { category: -1, value: 1 }, b: { category: -1, value: 0 } }, s));
    assert.ok(!clueHolds({ kind: "izquierda", a: { category: -1, value: 0 }, b: { category: -1, value: 1 } }, s));
    assert.ok(clueHolds({ kind: "al-lado", a: { category: 1, value: 1 }, b: { category: 1, value: 0 } }, s));
    assert.ok(clueHolds({ kind: "antes", a: { category: 1, value: 2 }, b: { category: 1, value: 0 } }, s));
  });

  it("redacta las pistas en español natural", () => {
    assert.equal(
      clueText(puzzle, { kind: "mismo", a: { category: -1, value: 0 }, b: { category: 1, value: 1 } }),
      "Ana tiene el perro.",
    );
    assert.equal(
      clueText(puzzle, { kind: "mismo", a: { category: 0, value: 2 }, b: { category: 1, value: 0 } }),
      "Quien tiene el gato vive en la casa 3.",
    );
    assert.equal(
      clueText(puzzle, { kind: "izquierda", a: { category: -1, value: 1 }, b: { category: 1, value: 1 } }),
      "Luis vive justo a la izquierda de quien tiene el perro.",
    );
  });

  it("cuenta errores y huecos de la respuesta", () => {
    const answer = emptyAnswer(puzzle);
    assert.deepEqual(countMistakes(puzzle, answer), { wrong: 0, missing: 6 });
    answer[0] = [1, 0, 2];
    answer[1] = [0, 2, 1];
    assert.deepEqual(countMistakes(puzzle, answer), { wrong: 2, missing: 0 });
  });
});

describe("generador", () => {
  for (let level = 1; level <= 10; level++) {
    it(`nivel ${level}: solución única con pistas verdaderas y mínimas`, () => {
      const spec = levelSpec(level);
      for (let seed = 1; seed <= 4; seed++) {
        const puzzle = generateLogicPuzzle(level, seededRandom(seed * 17 + level));
        assert.equal(puzzle.people.length, spec.people);
        const candidates = allAssignments(spec.people, puzzle.categories.length);
        for (const clue of puzzle.clues) assert.ok(clueHolds(clue, puzzle.solution), "pista falsa");
        assert.equal(countCompatible(candidates, puzzle.clues), 1, "solución única");
        for (const clue of puzzle.clues) {
          const without = puzzle.clues.filter((other) => other !== clue);
          assert.ok(countCompatible(candidates, without, 2) > 1, "pista redundante");
        }
        for (const clue of puzzle.clues) assert.match(clueText(puzzle, clue), /^[A-ZÁÉÍÓÚ].+\.$/);
      }
    });
  }
});
