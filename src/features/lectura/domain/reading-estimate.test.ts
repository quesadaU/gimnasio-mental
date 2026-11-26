import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countWords,
  elapsedMs,
  estimateMinutes,
  formatDuration,
  measureWordsPerMinute,
  pauseTimer,
  resumeTimer,
  scrollProgress,
  startTimer,
} from "./reading-estimate.ts";

test("countWords cuenta palabras con tildes, ñ, guiones y números, e ignora signos", () => {
  assert.equal(countWords(["¿Qué es, pues, la atención?", "Año 1924: niño-prodigio […]"]), 8);
  assert.equal(countWords([""]), 0);
  assert.equal(countWords(["Caminante,\nno hay camino"]), 4);
});

test("estimateMinutes redondea hacia arriba y nunca baja de 1", () => {
  assert.equal(estimateMinutes(0), 1);
  assert.equal(estimateMinutes(50), 1);
  assert.equal(estimateMinutes(221), 2);
  assert.equal(estimateMinutes(440, 220), 2);
  assert.equal(estimateMinutes(441, 220), 3);
  assert.equal(estimateMinutes(100, 0), 1);
});

test("measureWordsPerMinute devuelve un dato solo si la medición es plausible", () => {
  assert.equal(measureWordsPerMinute(400, 120_000), 200);
  assert.equal(measureWordsPerMinute(400, 10_000), undefined, "tiempo demasiado corto");
  assert.equal(measureWordsPerMinute(2000, 60_000), undefined, "demasiado rápido: hojeo");
  assert.equal(measureWordsPerMinute(50, 600_000), undefined, "demasiado lento: pausa larga");
  assert.equal(measureWordsPerMinute(0, 60_000), undefined);
});

test("el cronómetro activo no cuenta el tiempo en pausa", () => {
  let timer = startTimer(1_000);
  timer = pauseTimer(timer, 11_000);
  assert.equal(elapsedMs(timer, 50_000), 10_000);
  timer = resumeTimer(timer, 50_000);
  assert.equal(elapsedMs(timer, 55_000), 15_000);
  assert.deepEqual(resumeTimer(timer, 60_000), timer, "reanudar dos veces no reinicia");
  const paused = pauseTimer(timer, 60_000);
  assert.deepEqual(pauseTimer(paused, 90_000), paused, "pausar dos veces no suma");
});

test("formatDuration produce m:ss", () => {
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(65_400), "1:05");
  assert.equal(formatDuration(-5), "0:00");
});

test("scrollProgress va de 0 a 1 y maneja textos más cortos que la pantalla", () => {
  assert.equal(scrollProgress({ articleTop: 0, articleHeight: 2000, viewportHeight: 1000 }), 0);
  assert.equal(scrollProgress({ articleTop: -500, articleHeight: 2000, viewportHeight: 1000 }), 0.5);
  assert.equal(scrollProgress({ articleTop: -3000, articleHeight: 2000, viewportHeight: 1000 }), 1);
  assert.equal(scrollProgress({ articleTop: 100, articleHeight: 500, viewportHeight: 1000 }), 1);
  assert.equal(scrollProgress({ articleTop: 1200, articleHeight: 500, viewportHeight: 1000 }), 0);
});
