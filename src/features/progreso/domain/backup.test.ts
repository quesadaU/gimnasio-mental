import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BACKUP_FORMAT,
  MAX_BACKUP_BYTES,
  backupFileName,
  createBackup,
  isEmptyPlan,
  parseBackup,
  planImport,
} from "./backup.ts";
import { session, snapshot } from "./fixtures.test-helpers.ts";

const NOW = new Date("2026-11-25T12:00:00.000Z");

test("createBackup + parseBackup hacen ida y vuelta", () => {
  const original = snapshot({
    sessions: [session({ id: "s1" })],
    difficulty: { stroop: { exerciseId: "stroop", level: 4, updatedAt: "2026-11-20T10:10:00.000Z" } },
  });
  const text = JSON.stringify(createBackup(original, 1, NOW));
  const result = parseBackup(text, 1);
  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.snapshot, original);
});

test("backupFileName incluye la fecha", () => {
  assert.equal(backupFileName(NOW), "gimnasio-mental-progreso-2026-11-25.json");
});

test("parseBackup acepta un snapshot sin sobre", () => {
  const result = parseBackup(JSON.stringify(snapshot({ sessions: [session({ id: "x" })] })), 1);
  assert.equal(result.ok && result.snapshot.sessions.length, 1);
});

test("parseBackup rechaza JSON inválido, estructura desconocida, versión futura y tamaño excesivo", () => {
  assert.deepEqual(parseBackup("{no es json", 1), { ok: false, error: "json-invalido" });
  assert.deepEqual(parseBackup("[1,2,3]", 1), { ok: false, error: "formato-desconocido" });
  assert.deepEqual(parseBackup(JSON.stringify({ sessions: "x" }), 1), {
    ok: false,
    error: "formato-desconocido",
  });
  assert.deepEqual(
    parseBackup(JSON.stringify({ format: BACKUP_FORMAT, v: 99, data: snapshot() }), 1),
    { ok: false, error: "version-futura" },
  );
  assert.deepEqual(parseBackup(" ".repeat(MAX_BACKUP_BYTES + 1), 1), {
    ok: false,
    error: "demasiado-grande",
  });
});

test("parseBackup descarta sesiones, dificultades y tarjetas mal formadas", () => {
  const dirty = {
    ...snapshot(),
    sessions: [
      session({ id: "buena" }),
      { ...session({ id: "modulo-raro" }), module: "tiktok" },
      { ...session({ id: "nivel-raro" }), difficultyEnd: 42 },
      { id: "incompleta" },
      null,
    ],
    difficulty: {
      ok: { exerciseId: "ok", level: 3, updatedAt: "2026-11-20T00:00:00.000Z" },
      mal: { exerciseId: "mal", level: 0, updatedAt: "2026-11-20T00:00:00.000Z" },
    },
    reviewCards: {
      "d:1": {
        id: "d:1",
        deckId: "d",
        box: 2,
        dueAt: "2026-11-26T00:00:00.000Z",
        reviews: 1,
        lapses: 0,
        updatedAt: "2026-11-20T00:00:00.000Z",
      },
      "d:2": { id: "d:2", deckId: "d", box: "dos" },
    },
  };
  const result = parseBackup(JSON.stringify(dirty), 1);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(
    result.snapshot.sessions.map((s) => s.id),
    ["buena"],
  );
  assert.deepEqual(Object.keys(result.snapshot.difficulty), ["ok"]);
  assert.deepEqual(Object.keys(result.snapshot.reviewCards), ["d:1"]);
});

test("planImport fusiona: sesiones nuevas en orden cronológico y gana el updatedAt más reciente", () => {
  const current = snapshot({
    sessions: [session({ id: "a" })],
    difficulty: {
      stroop: { exerciseId: "stroop", level: 5, updatedAt: "2026-11-22T00:00:00.000Z" },
      nback: { exerciseId: "nback", level: 2, updatedAt: "2026-11-01T00:00:00.000Z" },
    },
  });
  const incoming = snapshot({
    sessions: [
      session({ id: "c", endedAt: "2026-11-23T10:00:00.000Z" }),
      session({ id: "a" }),
      session({ id: "b", endedAt: "2026-11-21T10:00:00.000Z" }),
      session({ id: "b", endedAt: "2026-11-21T10:00:00.000Z" }),
    ],
    difficulty: {
      stroop: { exerciseId: "stroop", level: 3, updatedAt: "2026-11-10T00:00:00.000Z" },
      nback: { exerciseId: "nback", level: 4, updatedAt: "2026-11-15T00:00:00.000Z" },
    },
  });
  const plan = planImport(current, incoming);
  assert.deepEqual(
    plan.sessions.map((s) => s.id),
    ["b", "c"],
  );
  assert.deepEqual(
    plan.difficulty.map((d) => [d.exerciseId, d.level]),
    [["nback", 4]],
  );
  assert.equal(isEmptyPlan(plan), false);
  assert.equal(isEmptyPlan(planImport(current, current)), true);
});
