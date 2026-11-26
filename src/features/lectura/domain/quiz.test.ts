import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeAnswer, summarizeQuiz } from "./quiz.ts";
import type { ReadingQuestion } from "./types.ts";

const questions: ReadingQuestion[] = [
  { id: "q1", kind: "literal", prompt: "¿?", options: ["a", "b", "c"], correctIndex: 1, explanation: "e1" },
  { id: "q2", kind: "inferencial", prompt: "¿?", options: ["a", "b"], correctIndex: 0, explanation: "e2" },
  { id: "q3", kind: "inferencial", prompt: "¿?", options: ["a", "b", "c", "d"], correctIndex: 3, explanation: "e3" },
];

test("gradeAnswer corrige y devuelve la explicación", () => {
  assert.deepEqual(gradeAnswer(questions[0], 1), {
    questionId: "q1",
    correct: true,
    correctIndex: 1,
    explanation: "e1",
  });
  assert.equal(gradeAnswer(questions[0], 0).correct, false);
});

test("gradeAnswer rechaza índices fuera de rango", () => {
  assert.throws(() => gradeAnswer(questions[0], 3), RangeError);
  assert.throws(() => gradeAnswer(questions[0], -1), RangeError);
  assert.throws(() => gradeAnswer(questions[0], 0.5), RangeError);
});

test("summarizeQuiz cuenta aciertos por tipo y puntúa sobre el total", () => {
  const summary = summarizeQuiz(questions, { q1: 1, q2: 1, q3: 3 });
  assert.equal(summary.total, 3);
  assert.equal(summary.answered, 3);
  assert.equal(summary.correct, 2);
  assert.equal(summary.score, 67);
  assert.deepEqual(summary.byKind, {
    literal: { total: 1, correct: 1 },
    inferencial: { total: 2, correct: 1 },
  });
});

test("summarizeQuiz trata como no respondidas las respuestas ausentes o inválidas", () => {
  const summary = summarizeQuiz(questions, { q1: 9, desconocida: 0 });
  assert.equal(summary.answered, 0);
  assert.equal(summary.correct, 0);
  assert.equal(summary.score, 0);
  assert.equal(summarizeQuiz([], {}).score, 0);
});
