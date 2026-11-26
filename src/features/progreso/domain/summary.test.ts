import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_SESSION_MINUTES, recentSessions, sessionMinutes, summarizeProgress } from "./summary.ts";
import { session } from "./fixtures.test-helpers.ts";

test("sessionMinutes calcula la duración y tolera fechas inválidas o invertidas", () => {
  assert.equal(sessionMinutes(session({ id: "a" })), 10);
  assert.equal(sessionMinutes({ startedAt: "nope", endedAt: "2026-11-20T10:10:00.000Z" }), 0);
  assert.equal(
    sessionMinutes({ startedAt: "2026-11-20T10:10:00.000Z", endedAt: "2026-11-20T10:00:00.000Z" }),
    0,
  );
});

test("sessionMinutes acota sesiones absurdamente largas", () => {
  const long = { startedAt: "2026-11-20T00:00:00.000Z", endedAt: "2026-11-21T00:00:00.000Z" };
  assert.equal(sessionMinutes(long), MAX_SESSION_MINUTES);
});

test("summarizeProgress con historial vacío", () => {
  assert.deepEqual(summarizeProgress([]), {
    totalSessions: 0,
    completedSessions: 0,
    totalMinutes: 0,
    byModule: [],
    activeDays: 0,
  });
});

test("summarizeProgress agrega por módulo, completadas y días activos", () => {
  const summary = summarizeProgress([
    session({ id: "1" }),
    session({ id: "2", endedAt: "2026-11-20T10:05:00.000Z", outcome: "abandonada" }),
    session({
      id: "3",
      module: "lectura",
      startedAt: "2026-11-22T08:00:00.000Z",
      endedAt: "2026-11-22T08:15:00.000Z",
    }),
  ]);
  assert.equal(summary.totalSessions, 3);
  assert.equal(summary.completedSessions, 2);
  assert.equal(summary.totalMinutes, 30);
  assert.equal(summary.activeDays, 2);
  assert.deepEqual(
    summary.byModule.map((m) => [m.module, m.sessions, m.minutes, m.lastEndedAt]),
    [
      ["patio", 2, 15, "2026-11-20T10:10:00.000Z"],
      ["lectura", 1, 15, "2026-11-22T08:15:00.000Z"],
    ],
  );
});

test("recentSessions ordena de más reciente a más antigua sin mutar la entrada", () => {
  const input = [
    session({ id: "old", endedAt: "2026-11-01T10:00:00.000Z" }),
    session({ id: "new", endedAt: "2026-11-24T10:00:00.000Z" }),
    session({ id: "mid", endedAt: "2026-11-10T10:00:00.000Z" }),
  ];
  assert.deepEqual(
    recentSessions(input, 2).map((s) => s.id),
    ["new", "mid"],
  );
  assert.equal(input[0].id, "old");
  assert.deepEqual(recentSessions(input, -1), []);
});
