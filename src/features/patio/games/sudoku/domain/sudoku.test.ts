import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LEVELS,
  candidates,
  countSolutions,
  findConflicts,
  generateSolvedGrid,
  generateSudoku,
  isSolved,
  seededRandom,
  solve,
  solveLogically,
  wrongCells,
  type Grid,
} from "./sudoku.ts";

function parse(text: string): Grid {
  return [...text.replace(/\s/g, "")].map((c) => (c === "." ? 0 : Number(c)));
}

// Sudoku clásico de dominio público (ejemplo de Wikipedia), solución única.
const CLASSIC = parse(`
  53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79
`);

describe("validación", () => {
  it("detecta números repetidos en fila, columna y caja", () => {
    const grid = CLASSIC.slice();
    grid[2] = 5; // repite el 5 de la casilla 0 en la fila y la caja
    const conflicts = findConflicts(grid);
    assert.ok(conflicts.has(0) && conflicts.has(2));
    assert.equal(findConflicts(CLASSIC).size, 0);
  });

  it("calcula candidatos a partir de las vecinas", () => {
    assert.deepEqual(candidates(CLASSIC, 2), [1, 2, 4]);
    assert.deepEqual(candidates(CLASSIC, 0), [], "casilla llena");
  });
});

describe("backtracking", () => {
  it("resuelve el clásico y la solución es válida", () => {
    const solution = solve(CLASSIC);
    assert.ok(solution);
    assert.ok(isSolved(solution));
    CLASSIC.forEach((v, i) => v && assert.equal(solution[i], v));
    assert.deepEqual(wrongCells(CLASSIC, solution), []);
  });

  it("cuenta más de una solución cuando faltan pistas y ninguna si hay conflicto", () => {
    const sparse = CLASSIC.slice();
    for (let i = 0; i < 81; i++) if (i % 2) sparse[i] = 0;
    assert.equal(countSolutions(sparse, 2), 2);
    assert.equal(countSolutions(new Array(81).fill(0), 2), 2);
    const broken = CLASSIC.slice();
    broken[2] = 5;
    assert.equal(countSolutions(broken), 0);
  });

  it("genera cuadrículas completas válidas y reproducibles por semilla", () => {
    const a = generateSolvedGrid(seededRandom(7));
    const b = generateSolvedGrid(seededRandom(7));
    assert.ok(isSolved(a));
    assert.deepEqual(a, b);
  });
});

describe("resolución lógica", () => {
  it("el clásico sale solo con singles", () => {
    const result = solveLogically(CLASSIC, ["single-desnudo", "single-oculto"]);
    assert.ok(result.solved);
  });

  it("sin técnicas no avanza", () => {
    assert.equal(solveLogically(CLASSIC, []).solved, false);
  });
});

describe("generador por niveles", () => {
  for (const config of LEVELS) {
    it(`nivel ${config.level}: solución única, pistas ≥ ${config.clues} y técnicas permitidas`, () => {
      for (const seed of [1, 2, 3]) {
        const generated = generateSudoku(config.level, seededRandom(seed * 100 + config.level));
        const clues = generated.puzzle.filter(Boolean).length;
        assert.equal(clues, generated.clues);
        assert.ok(clues >= config.clues - 1, `pistas ${clues}`);
        assert.equal(countSolutions(generated.puzzle, 2), 1, "solución única");
        assert.deepEqual(solve(generated.puzzle), generated.solution);
        assert.ok(isSolved(generated.solution));
        for (const technique of generated.techniques) {
          assert.ok(config.techniques.includes(technique), `técnica ${technique} fuera del nivel`);
        }
        // Simetría rotacional de las pistas.
        generated.puzzle.forEach((v, i) => assert.equal(Boolean(v), Boolean(generated.puzzle[80 - i])));
      }
    });
  }

  it("los niveles bajos tienen más pistas que los altos", () => {
    const easy = generateSudoku(1, seededRandom(11));
    const hard = generateSudoku(10, seededRandom(11));
    assert.ok(easy.clues > hard.clues);
  });
});
