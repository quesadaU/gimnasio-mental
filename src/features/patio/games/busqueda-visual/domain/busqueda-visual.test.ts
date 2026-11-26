import { test } from "node:test";
import assert from "node:assert/strict";
import { SEARCH_GRID, SEARCH_LEVELS, responseWindow } from "./params.ts";
import { evaluate, generateDisplay, summarize } from "./search.ts";

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

test("todos los niveles caben en la rejilla", () => {
  assert.equal(SEARCH_LEVELS.length, 10);
  const cells = SEARCH_GRID.columns * SEARCH_GRID.rows;
  for (const params of SEARCH_LEVELS) assert.ok(params.setSize <= cells);
  assert.equal(responseWindow(3, "sin-limite"), null);
  assert.equal(responseWindow(3, "ampliado"), 12000);
});

test("cada pantalla: tamaño correcto, celdas únicas y una sola T si está presente", () => {
  const rng = seeded(21);
  for (const params of SEARCH_LEVELS) {
    for (const present of [true, false]) {
      const display = generateDisplay(params.level, rng, present);
      assert.equal(display.items.length, params.setSize);
      assert.equal(new Set(display.items.map((item) => item.cell)).size, params.setSize);
      const targets = display.items.filter((item) => item.isTarget);
      assert.equal(targets.length, present ? 1 : 0);
      assert.ok(targets.every((item) => item.glyph === "T"));
      const distractorGlyph = params.distractorKind === "rasgo" ? "O" : "L";
      assert.ok(display.items.filter((i) => !i.isTarget).every((i) => i.glyph === distractorGlyph));
      assert.ok(
        display.items.every(
          (i) => Math.abs(i.jitterX) <= SEARCH_GRID.maxJitter && Math.abs(i.jitterY) <= SEARCH_GRID.maxJitter,
        ),
      );
    }
  }
});

test("la presencia del objetivo se reparte cerca del 50 %", () => {
  const rng = seeded(4);
  let present = 0;
  for (let i = 0; i < 2000; i++) if (generateDisplay(5, rng).targetPresent) present++;
  assert.ok(Math.abs(present / 2000 - 0.5) < 0.04);
});

test("evaluación y resumen", () => {
  const display = generateDisplay(4, seeded(1), true);
  assert.equal(evaluate(display, "presente"), "acierto");
  assert.equal(evaluate(display, "ausente"), "error");
  assert.equal(evaluate(display, null), "sin-respuesta");

  const summary = summarize([
    { level: 4, setSize: 12, targetPresent: true, outcome: "acierto", reactionMs: 900 },
    { level: 5, setSize: 16, targetPresent: false, outcome: "acierto", reactionMs: 1500 },
    { level: 5, setSize: 16, targetPresent: false, outcome: "error", reactionMs: 700 },
  ]);
  assert.equal(summary.correct, 2);
  assert.equal(summary.meanPresentMs, 900);
  assert.equal(summary.meanAbsentMs, 1500);
  assert.equal(summary.maxSetSize, 16);
  assert.equal(summary.score, 9);
});
