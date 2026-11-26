import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  describeFigure,
  explainRules,
  generateMatrix,
  isValidAnswer,
  levelSpec,
  rowSatisfies,
  sameFigure,
} from "./matrices.ts";
import { seededRandom } from "../../sudoku/domain/sudoku.ts";

describe("reglas de fila", () => {
  it("constante, progresión y distribución", () => {
    assert.ok(rowSatisfies({ attribute: "forma", rule: "constante" }, [2, 2, 2], []));
    assert.ok(!rowSatisfies({ attribute: "forma", rule: "constante" }, [2, 2, 1], []));
    assert.ok(rowSatisfies({ attribute: "cantidad", rule: "progresion", step: 1 }, [0, 1, 2], []));
    assert.ok(rowSatisfies({ attribute: "cantidad", rule: "progresion", step: -1 }, [3, 2, 1], []));
    assert.ok(!rowSatisfies({ attribute: "cantidad", rule: "progresion", step: 1 }, [0, 1, 3], []));
    const rule = { attribute: "relleno", rule: "distribucion" } as const;
    assert.ok(rowSatisfies(rule, [2, 0, 1], [[0, 1, 2]]));
    assert.ok(!rowSatisfies(rule, [2, 2, 1], [[0, 1, 2]]));
  });
});

describe("generador de matrices", () => {
  for (let level = 1; level <= 10; level++) {
    it(`nivel ${level}: respuesta única y opciones distintas`, () => {
      const spec = levelSpec(level);
      for (let seed = 1; seed <= 40; seed++) {
        const puzzle = generateMatrix(level, seededRandom(seed * 31 + level));
        assert.equal(puzzle.options.length, spec.options);
        assert.ok(sameFigure(puzzle.options[puzzle.answerIndex], puzzle.cells[8]));
        const valid = puzzle.options.filter((option) => isValidAnswer(puzzle, option));
        assert.equal(valid.length, 1, "solo una opción cumple todas las reglas");
        for (let a = 0; a < puzzle.options.length; a++) {
          for (let b = a + 1; b < puzzle.options.length; b++) {
            assert.ok(!sameFigure(puzzle.options[a], puzzle.options[b]), "opciones repetidas");
          }
        }
        // Las dos primeras filas cumplen también las reglas (coherencia del generador).
        for (const rule of puzzle.rules) {
          const values = puzzle.cells.map((cell) => cell[rule.attribute]);
          assert.ok(rowSatisfies(rule, values.slice(0, 3), [values.slice(0, 3)]));
          assert.ok(rowSatisfies(rule, values.slice(3, 6), [values.slice(0, 3)]));
        }
        const varying = puzzle.rules.filter((rule) => rule.rule !== "constante").length;
        assert.ok(varying <= spec.varying);
      }
    });
  }

  it("describe figuras y reglas en español", () => {
    assert.equal(describeFigure({ forma: 0, cantidad: 1, relleno: 2, tamano: 2 }), "dos círculos grandes rellenos");
    assert.equal(describeFigure({ forma: 2, cantidad: 0, relleno: 0, tamano: 0 }), "un triángulo pequeño vacío");
    assert.match(explainRules([{ attribute: "cantidad", rule: "progresion", step: 1 }])[0], /aumenta/);
  });
});
