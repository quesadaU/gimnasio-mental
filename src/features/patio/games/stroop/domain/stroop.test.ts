import { test } from "node:test";
import assert from "node:assert/strict";
import { STROOP_LEVELS, paramsForLevel, responseWindow } from "./params.ts";
import { evaluateResponse, generateTrial, type StroopTrial } from "./trials.ts";
import { summarize } from "./scoring.ts";

/** RNG determinista (mulberry32) para fijar la semilla en las pruebas. */
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

const OPTIONS = ["rojo", "azul", "verde", "amarillo"];

test("la tabla cubre los niveles 1-10 y es monótona en dificultad", () => {
  assert.equal(STROOP_LEVELS.length, 10);
  STROOP_LEVELS.forEach((params, index) => {
    assert.equal(params.level, index + 1);
    if (index > 0) {
      assert.ok(params.incongruentRatio >= STROOP_LEVELS[index - 1].incongruentRatio);
      assert.ok(params.responseWindowMs < STROOP_LEVELS[index - 1].responseWindowMs);
    }
  });
});

test("los modos de tiempo amplían o eliminan la ventana", () => {
  assert.equal(responseWindow(5, "estandar"), paramsForLevel(5).responseWindowMs);
  assert.equal(responseWindow(5, "ampliado"), paramsForLevel(5).responseWindowMs * 2);
  assert.equal(responseWindow(5, "sin-limite"), null);
});

test("congruencia coherente y proporción de incongruentes cercana a la del nivel", () => {
  const rng = seeded(42);
  for (const level of [1, 10] as const) {
    let incongruent = 0;
    let previous: StroopTrial | undefined;
    const n = 4000;
    for (let i = 0; i < n; i++) {
      const trial = generateTrial(OPTIONS, level, rng, previous);
      assert.equal(trial.congruent, trial.wordId === trial.featureId);
      if (previous) assert.notEqual(trial.featureId, previous.featureId);
      if (!trial.congruent) incongruent++;
      previous = trial;
    }
    const expected = paramsForLevel(level).incongruentRatio;
    assert.ok(Math.abs(incongruent / n - expected) < 0.03, `nivel ${level}: ${incongruent / n}`);
  }
});

test("misma semilla, misma secuencia", () => {
  const a = seeded(7);
  const b = seeded(7);
  for (let i = 0; i < 20; i++) {
    assert.deepEqual(generateTrial(OPTIONS, 5, a), generateTrial(OPTIONS, 5, b));
  }
});

test("evaluación de respuestas", () => {
  const trial: StroopTrial = { wordId: "rojo", featureId: "azul", congruent: false };
  assert.equal(evaluateResponse(trial, "azul", 800, 1000), "acierto");
  assert.equal(evaluateResponse(trial, "rojo", 800, 1000), "error");
  assert.equal(evaluateResponse(trial, null, null, 1000), "sin-respuesta");
  assert.equal(evaluateResponse(trial, "azul", 1200, 1000), "tarde");
  assert.equal(evaluateResponse(trial, "azul", 9000, null), "acierto");
});

test("resumen: puntos por nivel e interferencia", () => {
  const summary = summarize([
    { level: 2, congruent: true, kind: "acierto", reactionMs: 600 },
    { level: 3, congruent: false, kind: "acierto", reactionMs: 800 },
    { level: 3, congruent: false, kind: "error", reactionMs: 500 },
    { level: 2, congruent: true, kind: "sin-respuesta" },
  ]);
  assert.equal(summary.trials, 4);
  assert.equal(summary.correct, 2);
  assert.equal(summary.score, 5);
  assert.equal(summary.meanReactionMs, 700);
  assert.equal(summary.interferenceMs, 200);
  assert.equal(summarize([]).accuracy, 0);
});
