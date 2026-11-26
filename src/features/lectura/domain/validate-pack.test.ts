import { test } from "node:test";
import assert from "node:assert/strict";
import type { ContentPack } from "../../../core/types.ts";
import type { ReadingText } from "./types.ts";
import { validateReadingPack } from "./validate-pack.ts";

function validText(): ReadingText {
  return {
    id: "texto-valido",
    title: "Título",
    summary: "Resumen",
    topic: "memoria",
    level: "inicial",
    words: 3,
    source: { kind: "original", author: "Equipo", license: "Original" },
    paragraphs: ["Uno dos tres."],
    questions: [
      { id: "q-1", kind: "literal", prompt: "¿1?", options: ["a", "b"], correctIndex: 0, explanation: "e" },
      { id: "q-2", kind: "inferencial", prompt: "¿2?", options: ["a", "b"], correctIndex: 1, explanation: "e" },
      { id: "q-3", kind: "vocabulario", prompt: "¿3?", options: ["a", "b"], correctIndex: 1, explanation: "e" },
    ],
    keyIdeas: [{ id: "idea", prompt: "¿?", answer: "R" }],
  };
}

function pack(text: ReadingText): ContentPack<ReadingText> {
  return { id: text.id, module: "lectura", version: 1, locale: "es", title: text.title, items: [text] };
}

test("un paquete correcto no tiene errores", () => {
  assert.deepEqual(validateReadingPack(pack(validText())), []);
});

test("detecta respuesta fuera de rango, pocas preguntas, ids duplicados y falta de licencia", () => {
  const base = validText();
  const broken: ReadingText = {
    ...base,
    words: 99,
    source: { ...base.source, license: " " },
    questions: [
      { ...base.questions[0], correctIndex: 2 },
      { ...base.questions[1], id: "q-1" },
    ],
  };
  const errors = validateReadingPack(pack(broken)).join("\n");
  assert.match(errors, /fuera de rango/);
  assert.match(errors, /entre 3 y 5 preguntas/);
  assert.match(errors, /pregunta duplicada/);
  assert.match(errors, /licencia/);
  assert.match(errors, /words=99/);
});

test("un texto de dominio público exige obra y referencia, y 'repaso' es un id reservado", () => {
  const base = validText();
  const errors = validateReadingPack(
    pack({ ...base, id: "repaso", source: { kind: "dominio-publico", author: "X", license: "DP" } }),
  ).join("\n");
  assert.match(errors, /dominio público/);
  assert.match(errors, /reservado/);
});

test("exige al menos una pregunta inferencial", () => {
  const base = validText();
  const errors = validateReadingPack(
    pack({ ...base, questions: base.questions.map((q) => ({ ...q, kind: "literal" as const })) }),
  );
  assert.ok(errors.some((e) => e.includes("inferencial")));
});
