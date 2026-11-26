import { test } from "node:test";
import assert from "node:assert/strict";
import type { SessionResult } from "../../../core/types.ts";
import { durationBucket, filterCatalog, readTextIds } from "./library.ts";
import type { ReadingTextMeta } from "./types.ts";

const catalog: ReadingTextMeta[] = [
  { id: "a", title: "A", summary: "", topic: "atencion", level: "inicial", words: 150, sourceKind: "original", author: "x" },
  { id: "b", title: "B", summary: "", topic: "ciencia", level: "avanzado", words: 300, sourceKind: "original", author: "x" },
  { id: "c", title: "C", summary: "", topic: "atencion", level: "avanzado", words: 401, sourceKind: "dominio-publico", author: "y" },
];

function session(partial: Partial<SessionResult>): SessionResult {
  return {
    id: crypto.randomUUID(),
    schemaVersion: 1,
    exerciseId: "lectura-profunda",
    module: "lectura",
    startedAt: "2026-11-25T10:00:00.000Z",
    endedAt: "2026-11-25T10:05:00.000Z",
    outcome: "completada",
    difficultyStart: 3,
    difficultyEnd: 3,
    trials: 3,
    correct: 2,
    score: 67,
    ...partial,
  };
}

test("durationBucket clasifica por número de palabras", () => {
  assert.equal(durationBucket(150), "corto");
  assert.equal(durationBucket(200), "medio");
  assert.equal(durationBucket(400), "medio");
  assert.equal(durationBucket(401), "largo");
});

test("readTextIds solo cuenta lecturas completadas del módulo", () => {
  const ids = readTextIds([
    session({ contentId: "a" }),
    session({ contentId: "b", outcome: "abandonada" }),
    session({ contentId: "c", exerciseId: "lectura-repaso" }),
    session({ contentId: "c", module: "habilidades" }),
    session({ contentId: undefined }),
  ]);
  assert.deepEqual([...ids], ["a"]);
});

test("filterCatalog combina tema, nivel, duración y estado", () => {
  const read = new Set(["a"]);
  assert.deepEqual(filterCatalog(catalog, {}).map((t) => t.id), ["a", "b", "c"]);
  assert.deepEqual(filterCatalog(catalog, { topic: "atencion" }).map((t) => t.id), ["a", "c"]);
  assert.deepEqual(filterCatalog(catalog, { topic: "atencion", level: "avanzado" }).map((t) => t.id), ["c"]);
  assert.deepEqual(filterCatalog(catalog, { duration: "medio" }).map((t) => t.id), ["b"]);
  assert.deepEqual(filterCatalog(catalog, { status: "leidos" }, read).map((t) => t.id), ["a"]);
  assert.deepEqual(filterCatalog(catalog, { status: "pendientes" }, read).map((t) => t.id), ["b", "c"]);
  assert.deepEqual(filterCatalog(catalog, { topic: "filosofia" }), []);
});
