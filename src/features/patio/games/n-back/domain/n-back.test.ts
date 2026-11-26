import { test } from "node:test";
import assert from "node:assert/strict";
import { N_BACK_LEVELS, N_BACK_SESSION, blockLength, timingFor } from "./params.ts";
import {
  evaluate,
  generateBlock,
  isBlockSuccess,
  summarize,
  type NBackRecord,
} from "./trials.ts";

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

const LETTERS = ["C", "H", "K", "L", "Q", "R", "S", "T"];

test("tabla de niveles: n no decrece y está entre 1 y 4", () => {
  assert.equal(N_BACK_LEVELS.length, 10);
  for (let i = 0; i < N_BACK_LEVELS.length; i++) {
    assert.ok(N_BACK_LEVELS[i].n >= 1 && N_BACK_LEVELS[i].n <= 4);
    if (i > 0) assert.ok(N_BACK_LEVELS[i].n >= N_BACK_LEVELS[i - 1].n);
  }
  assert.equal(blockLength(2), 22);
  assert.equal(timingFor(1, "ampliado").trialMs, 4500);
  assert.equal(timingFor(1, "sin-limite").trialMs, null);
});

test("cada bloque tiene exactamente las coincidencias pedidas, en todos los niveles", () => {
  const rng = seeded(11);
  for (const params of N_BACK_LEVELS) {
    for (let round = 0; round < 200; round++) {
      const spec = {
        n: params.n,
        length: blockLength(params.n),
        targets: N_BACK_SESSION.targetsPerBlock,
        lures: params.luresPerBlock,
      };
      const block = generateBlock(spec, LETTERS, rng);
      assert.equal(block.length, spec.length);
      assert.equal(block.filter((t) => t.isTarget).length, spec.targets);
      block.forEach((trial, i) => {
        assert.equal(trial.isTarget, i >= spec.n && block[i - spec.n].letter === trial.letter);
        if (trial.isLure) {
          assert.equal(trial.isTarget, false);
          const near = [spec.n - 1, spec.n + 1].filter((o) => o >= 1 && i - o >= 0);
          assert.ok(near.some((o) => block[i - o].letter === trial.letter));
        }
      });
    }
  }
});

test("los señuelos aparecen cuando el nivel los pide", () => {
  const block = generateBlock({ n: 3, length: 23, targets: 6, lures: 3 }, LETTERS, seeded(5));
  assert.ok(block.filter((t) => t.isLure).length >= 1);
});

test("evaluación y criterio de bloque", () => {
  const target = { letter: "K", isTarget: true, isLure: false };
  const other = { letter: "C", isTarget: false, isLure: false };
  assert.equal(evaluate(target, true), "acierto");
  assert.equal(evaluate(target, false), "omision");
  assert.equal(evaluate(other, true), "falsa-alarma");
  assert.equal(evaluate(other, false), "rechazo-correcto");

  const r = (outcome: NBackRecord["outcome"]): NBackRecord => ({ level: 3, n: 2, outcome });
  const block = Array.from({ length: 19 }, () => r("rechazo-correcto"));
  assert.equal(isBlockSuccess([...block, r("omision"), r("omision"), r("falsa-alarma")]), true);
  assert.equal(
    isBlockSuccess([...block, r("omision"), r("omision"), r("falsa-alarma"), r("omision")]),
    false,
  );
});

test("resumen: discriminación y n máximo", () => {
  const summary = summarize([
    { level: 3, n: 2, outcome: "acierto", reactionMs: 600 },
    { level: 3, n: 2, outcome: "omision" },
    { level: 6, n: 3, outcome: "falsa-alarma", reactionMs: 500 },
    { level: 6, n: 3, outcome: "rechazo-correcto" },
    { level: 6, n: 3, outcome: "rechazo-correcto" },
    { level: 6, n: 3, outcome: "rechazo-correcto" },
  ]);
  assert.equal(summary.hits, 1);
  assert.equal(summary.discrimination, 0.5 - 0.25);
  assert.equal(summary.maxN, 3);
  assert.equal(summary.meanReactionMs, 600);
  assert.equal(summary.correct, 4);
  assert.equal(summary.score, 3 + 18);
});
