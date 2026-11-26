import { test } from "node:test";
import assert from "node:assert/strict";
import { SESSION_SCHEMA_VERSION } from "../../../core/types.ts";
import {
  buildReadingSession,
  buildReviewSession,
  percentScore,
  READING_EXERCISE_ID,
  REVIEW_EXERCISE_ID,
} from "./session.ts";

const startedAt = new Date("2026-11-25T10:00:00.000Z");
const endedAt = new Date("2026-11-25T10:08:30.000Z");

test("buildReadingSession construye un SessionResult completo", () => {
  const result = buildReadingSession({
    id: "00000000-0000-4000-8000-000000000000",
    startedAt,
    endedAt,
    trials: 4,
    correct: 3,
    textId: "la-caverna",
    level: "intermedio",
  });
  assert.deepEqual(result, {
    id: "00000000-0000-4000-8000-000000000000",
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: READING_EXERCISE_ID,
    module: "lectura",
    contentId: "la-caverna",
    startedAt: "2026-11-25T10:00:00.000Z",
    endedAt: "2026-11-25T10:08:30.000Z",
    outcome: "completada",
    difficultyStart: 5,
    difficultyEnd: 5,
    trials: 4,
    correct: 3,
    score: 75,
  });
});

test("buildReviewSession usa su propio ejercicio y no lleva contentId", () => {
  const result = buildReviewSession({ id: "x", startedAt, endedAt, trials: 5, correct: 5 });
  assert.equal(result.exerciseId, REVIEW_EXERCISE_ID);
  assert.equal(result.contentId, undefined);
  assert.equal(result.score, 100);
});

test("los datos incoherentes se rechazan", () => {
  const base = { id: "x", startedAt, endedAt, textId: "t", level: "inicial" as const };
  assert.throws(() => buildReadingSession({ ...base, trials: 3, correct: 4 }), RangeError);
  assert.throws(() => buildReadingSession({ ...base, trials: -1, correct: 0 }), RangeError);
  assert.throws(() => buildReadingSession({ ...base, endedAt: new Date(0), trials: 3, correct: 1 }), RangeError);
  assert.throws(() => buildReadingSession({ ...base, id: "", trials: 3, correct: 1 }));
});

test("percentScore está acotado y redondeado", () => {
  assert.equal(percentScore(0, 0), 0);
  assert.equal(percentScore(1, 3), 33);
  assert.equal(percentScore(2, 3), 67);
  assert.equal(percentScore(9, 3), 100);
});
