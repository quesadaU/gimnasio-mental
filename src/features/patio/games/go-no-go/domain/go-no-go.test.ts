import { test } from "node:test";
import assert from "node:assert/strict";
import { GO_NO_GO_LEVELS, GO_NO_GO_SESSION, timingFor } from "./params.ts";
import {
  evaluate,
  generateBlock,
  isBlockSuccess,
  noGoCount,
  noGoPositions,
  summarize,
  type GoNoGoRecord,
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

test("tabla de niveles: 10 niveles, no-go no más frecuentes y ritmo no más lento al subir", () => {
  assert.equal(GO_NO_GO_LEVELS.length, 10);
  for (let i = 1; i < GO_NO_GO_LEVELS.length; i++) {
    assert.ok(GO_NO_GO_LEVELS[i].noGoRatio <= GO_NO_GO_LEVELS[i - 1].noGoRatio);
    assert.ok(GO_NO_GO_LEVELS[i].stimulusMs < GO_NO_GO_LEVELS[i - 1].stimulusMs);
  }
});

test("modos de tiempo", () => {
  assert.deepEqual(timingFor(1, "estandar"), { stimulusMs: 1000, isiMs: 1200 });
  assert.deepEqual(timingFor(1, "ampliado"), { stimulusMs: 2000, isiMs: 2400 });
  assert.equal(timingFor(1, "sin-limite").stimulusMs, null);
});

test("los no-go nunca van seguidos y su número es el del nivel", () => {
  const rng = seeded(3);
  for (let round = 0; round < 500; round++) {
    const positions = noGoPositions(10, 3, rng);
    assert.equal(positions.length, 3);
    for (let i = 1; i < positions.length; i++) assert.ok(positions[i] - positions[i - 1] >= 2);
    assert.ok(positions.every((p) => p >= 0 && p < 10));
  }
  const block = generateBlock(1, 10, ["A", "E"], "X", seeded(9));
  assert.equal(block.filter((t) => t.kind === "nogo").length, noGoCount(1, 10));
  assert.ok(block.every((t) => (t.kind === "nogo" ? t.stimulus === "X" : t.stimulus !== "X")));
  assert.equal(noGoCount(10, 10), 1);
});

test("evaluación: aciertos, omisiones, comisiones y anticipaciones", () => {
  const go = { kind: "go", stimulus: "A" } as const;
  const nogo = { kind: "nogo", stimulus: "X" } as const;
  assert.equal(evaluate(go, true, 400), "acierto");
  assert.equal(evaluate(go, true, GO_NO_GO_SESSION.anticipationMs - 1), "anticipacion");
  assert.equal(evaluate(go, false, null), "omision");
  assert.equal(evaluate(go, true, null), "acierto");
  assert.equal(evaluate(nogo, true, 300), "comision");
  assert.equal(evaluate(nogo, false, null), "rechazo-correcto");
});

test("criterio de bloque y resumen", () => {
  const record = (outcome: GoNoGoRecord["outcome"], reactionMs?: number): GoNoGoRecord => ({
    level: 2,
    kind: outcome === "comision" || outcome === "rechazo-correcto" ? "nogo" : "go",
    outcome,
    reactionMs,
  });
  const good = [...Array(9)].map(() => record("acierto", 400)).concat(record("comision", 300));
  const bad = good.slice(0, 8).concat(record("comision", 300), record("omision"));
  assert.equal(isBlockSuccess(good), true);
  assert.equal(isBlockSuccess(bad), false);
  assert.equal(isBlockSuccess([]), false);

  const summary = summarize([...good, record("rechazo-correcto")]);
  assert.equal(summary.trials, 11);
  assert.equal(summary.correct, 10);
  assert.equal(summary.commissions, 1);
  assert.equal(summary.correctRejections, 1);
  assert.equal(summary.meanReactionMs, 400);
  assert.equal(summary.score, 20);
});
