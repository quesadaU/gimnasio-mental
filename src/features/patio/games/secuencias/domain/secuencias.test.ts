import { test } from "node:test";
import assert from "node:assert/strict";
import { DIGIT_POOL, SPAN_LEVELS, SPATIAL_GRID_SIZE } from "./params.ts";
import {
  checkAnswer,
  expectedAnswer,
  generateCells,
  generateDigits,
  generateSequence,
  summarize,
} from "./sequences.ts";

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

test("nivel -> longitud: 3 a 12 y cabe en la rejilla espacial", () => {
  assert.deepEqual(
    SPAN_LEVELS.map((p) => p.length),
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  );
  assert.ok(SPAN_LEVELS.every((p) => p.length <= SPATIAL_GRID_SIZE ** 2));
});

test("dígitos: sin repeticiones mientras se pueda, nunca seguidos y sin tramos de tres", () => {
  const rng = seeded(8);
  for (const { length } of SPAN_LEVELS) {
    for (let round = 0; round < 300; round++) {
      const digits = generateDigits(length, rng);
      assert.equal(digits.length, length);
      assert.ok(digits.every((d) => DIGIT_POOL.includes(d)));
      if (length <= DIGIT_POOL.length) assert.equal(new Set(digits).size, length);
      for (let i = 1; i < digits.length; i++) assert.notEqual(digits[i], digits[i - 1]);
      for (let i = 2; i < digits.length; i++) {
        const up = digits[i - 1] - digits[i - 2] === 1 && digits[i] - digits[i - 1] === 1;
        const down = digits[i - 1] - digits[i - 2] === -1 && digits[i] - digits[i - 1] === -1;
        if (length <= DIGIT_POOL.length) assert.ok(!up && !down, digits.join(","));
      }
    }
  }
});

test("espacial: casillas distintas dentro de la rejilla", () => {
  const rng = seeded(2);
  for (let round = 0; round < 200; round++) {
    const cells = generateCells(12, rng);
    assert.equal(new Set(cells).size, 12);
    assert.ok(cells.every((c) => c >= 0 && c < SPATIAL_GRID_SIZE ** 2));
  }
  assert.equal(generateSequence("espacial", 4, rng).length, 6);
});

test("respuesta esperada e inversa; corrección estricta", () => {
  assert.deepEqual(expectedAnswer("digitos-directo", [3, 8, 1]), [3, 8, 1]);
  assert.deepEqual(expectedAnswer("digitos-inverso", [3, 8, 1]), [1, 8, 3]);
  assert.deepEqual(checkAnswer([1, 8, 3], [1, 8, 3]), { correct: true, positionsCorrect: 3 });
  assert.deepEqual(checkAnswer([1, 8, 3], [1, 3, 8]), { correct: false, positionsCorrect: 1 });
  assert.equal(checkAnswer([1, 8, 3], [1, 8]).correct, false);
});

test("resumen", () => {
  const summary = summarize([
    { level: 2, length: 4, correct: true },
    { level: 3, length: 5, correct: false },
    { level: 2, length: 4, correct: true },
  ]);
  assert.deepEqual(summary, { trials: 3, correct: 2, longestSpan: 4, score: 4 });
});
