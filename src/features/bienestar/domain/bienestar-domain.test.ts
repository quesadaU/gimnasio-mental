import { test } from "node:test";
import assert from "node:assert/strict";

import { BREATHING_PATTERNS, breathsPerMinute, cycleSeconds, isGentlePattern } from "./breathing.ts";
import type { BreathingPattern } from "./breathing.ts";
import { describeDuration, formatClock, phaseAt, scheduleSteps, stepIndexAt, wholeCycles } from "./phase-timer.ts";
import { suggestsCrisis } from "./crisis.ts";
import {
  addEntry,
  buildExport,
  createEntry,
  emptyJournal,
  isJournalData,
  MAX_EMOTIONS_PER_ENTRY,
  removeEntry,
  validateDraft,
} from "./journal.ts";
import type { JournalDraft } from "./journal.ts";
import {
  checkIn,
  emptyChallenges,
  isChallengesData,
  leaveChallenge,
  localDay,
  reflectOnAnswers,
  startChallenge,
  suggestedChallengeIds,
  summarize,
} from "./digital-hygiene.ts";
import type { DigitalChallenge, SelfCheckQuestion } from "./types.ts";
import { buildPracticeSession, sessionDurationMs } from "./session.ts";

// --- Respiración ---------------------------------------------------------------------------

test("todos los patrones incluidos son suaves (lentos, sin retenciones largas)", () => {
  for (const pattern of BREATHING_PATTERNS) {
    assert.ok(isGentlePattern(pattern), `${pattern.id} no cumple los criterios`);
    assert.ok(breathsPerMinute(pattern) <= 8);
  }
});

test("4-6 da 10 s por ciclo y 6 respiraciones por minuto", () => {
  const pattern = BREATHING_PATTERNS.find((p) => p.id === "4-6");
  assert.ok(pattern);
  assert.equal(cycleSeconds(pattern), 10);
  assert.equal(breathsPerMinute(pattern), 6);
});

test("rechaza hiperventilación, retenciones largas y exhalación más corta", () => {
  const rapid: BreathingPattern = { id: "r", name: "r", summary: "", phases: [{ kind: "inhala", seconds: 1 }, { kind: "exhala", seconds: 1 }] };
  const longHold: BreathingPattern = {
    id: "h",
    name: "h",
    summary: "",
    phases: [{ kind: "inhala", seconds: 4 }, { kind: "reten", seconds: 7 }, { kind: "exhala", seconds: 8 }],
  };
  const shortExhale: BreathingPattern = { id: "s", name: "s", summary: "", phases: [{ kind: "inhala", seconds: 6 }, { kind: "exhala", seconds: 4 }] };
  assert.equal(isGentlePattern(rapid), false);
  assert.equal(isGentlePattern(longHold), false);
  assert.equal(isGentlePattern(shortExhale), false);
  assert.equal(isGentlePattern({ id: "v", name: "v", summary: "", phases: [] }), false);
});

// --- Temporizador por fases ----------------------------------------------------------------

test("phaseAt recorre las fases y cicla", () => {
  const phases = [{ seconds: 4 }, { seconds: 6 }];
  assert.deepEqual(phaseAt(phases, 0), { cycleIndex: 0, phaseIndex: 0, phase: phases[0], phaseElapsedMs: 0, phaseRemainingMs: 4000 });
  assert.equal(phaseAt(phases, 3999).phaseIndex, 0);
  assert.equal(phaseAt(phases, 4000).phaseIndex, 1);
  assert.equal(phaseAt(phases, 9000).phaseRemainingMs, 1000);
  const next = phaseAt(phases, 10_500);
  assert.equal(next.cycleIndex, 1);
  assert.equal(next.phaseIndex, 0);
  assert.equal(phaseAt(phases, -50).phaseElapsedMs, 0);
  assert.equal(phaseAt(phases, Number.NaN).phaseIndex, 0);
});

test("phaseAt lanza con secuencias vacías o de duración cero", () => {
  assert.throws(() => phaseAt([], 0));
  assert.throws(() => phaseAt([{ seconds: 0 }], 0));
});

test("wholeCycles redondea a ciclos enteros", () => {
  assert.equal(wholeCycles([{ seconds: 4 }, { seconds: 6 }], 120_000), 12);
  assert.equal(wholeCycles([{ seconds: 16 }], 120_000), 8);
  assert.equal(wholeCycles([{ seconds: 4 }], 0), 0);
});

test("scheduleSteps reparte por peso y cubre todo el tiempo", () => {
  const slots = scheduleSteps([{}, { weight: 2 }, {}], 180_000);
  assert.equal(slots.length, 3);
  assert.equal(slots[0].startMs, 0);
  assert.equal(slots[0].endMs, 45_000);
  assert.equal(slots[1].endMs, 135_000);
  assert.equal(slots[2].endMs, 180_000);
  for (let i = 1; i < slots.length; i++) assert.equal(slots[i].startMs, slots[i - 1].endMs);
  assert.deepEqual(scheduleSteps([], 1000), []);
});

test("stepIndexAt devuelve el paso activo y null al terminar", () => {
  const slots = scheduleSteps([{}, {}], 60_000);
  assert.equal(stepIndexAt(slots, 0), 0);
  assert.equal(stepIndexAt(slots, 30_000), 1);
  assert.equal(stepIndexAt(slots, 60_000), null);
});

test("formatClock y describeDuration", () => {
  assert.equal(formatClock(65_000), "1:05");
  assert.equal(formatClock(59_100), "1:00");
  assert.equal(formatClock(-5), "0:00");
  assert.equal(describeDuration(125_000), "2 minutos y 5 segundos");
  assert.equal(describeDuration(60_000), "1 minuto");
  assert.equal(describeDuration(1_000), "1 segundo");
});

// --- Detección prudente de crisis ----------------------------------------------------------

test("suggestsCrisis detecta expresiones con o sin tildes y mayúsculas", () => {
  assert.equal(suggestsCrisis("A veces pienso en el SUICIDIO"), true);
  assert.equal(suggestsCrisis("no quiero vivir así"), true);
  assert.equal(suggestsCrisis("Tengo ganas de hacerme daño"), true);
  assert.equal(suggestsCrisis("Estarían mejor sin mí"), true);
  assert.equal(suggestsCrisis(undefined, "", "quiero morirme"), true);
});

test("suggestsCrisis no salta con frases cotidianas", () => {
  assert.equal(suggestsCrisis("Me muero de risa con mi hermana"), false);
  assert.equal(suggestsCrisis("Voy a cortarme el pelo mañana"), false);
  assert.equal(suggestsCrisis("Estoy cansada del trabajo"), false);
  assert.equal(suggestsCrisis(""), false);
  assert.equal(suggestsCrisis(), false);
});

// --- Registro emocional --------------------------------------------------------------------

const draft: JournalDraft = {
  emotions: ["preocupacion"],
  intensity: 7,
  situation: "  Reunión con mi jefa  ",
  thought: "Lo voy a hacer fatal",
  reappraisalPromptId: "hechos-suposiciones",
  reappraisalAnswer: "  Me he preparado bien  ",
  intensityAfter: 5,
};

test("validateDraft señala problemas sin juzgar el contenido", () => {
  assert.deepEqual(validateDraft(draft), []);
  assert.ok(validateDraft({ ...draft, emotions: [] }).includes("sin-emocion"));
  assert.ok(validateDraft({ ...draft, emotions: Array(MAX_EMOTIONS_PER_ENTRY + 1).fill("x") }).includes("demasiadas-emociones"));
  assert.ok(validateDraft({ ...draft, intensity: 11 }).includes("intensidad-invalida"));
  assert.ok(validateDraft({ ...draft, intensity: 2.5 }).includes("intensidad-invalida"));
  assert.ok(validateDraft({ ...draft, thought: "a".repeat(2001) }).includes("texto-largo"));
});

test("createEntry recorta textos y omite la reevaluación vacía", () => {
  const now = new Date("2026-11-25T10:00:00.000Z");
  const entry = createEntry(draft, "id-1", now);
  assert.equal(entry.situation, "Reunión con mi jefa");
  assert.deepEqual(entry.reappraisal, { promptId: "hechos-suposiciones", answer: "Me he preparado bien" });
  assert.equal(entry.createdAt, now.toISOString());
  const noReappraisal = createEntry({ ...draft, reappraisalAnswer: "   ", intensityAfter: undefined }, "id-2", now);
  assert.equal(noReappraisal.reappraisal, undefined);
  assert.equal("intensityAfter" in noReappraisal, false);
  assert.throws(() => createEntry({ ...draft, emotions: [] }, "id-3", now));
});

test("addEntry pone primero lo más reciente, evita duplicados y respeta el máximo", () => {
  const now = new Date("2026-11-25T10:00:00.000Z");
  let data = emptyJournal();
  data = addEntry(data, createEntry(draft, "a", now));
  data = addEntry(data, createEntry(draft, "b", now));
  data = addEntry(data, createEntry(draft, "b", now));
  assert.deepEqual(data.entries.map((e) => e.id), ["b", "a"]);
  assert.deepEqual(addEntry(data, createEntry(draft, "c", now), 2).entries.map((e) => e.id), ["c", "b"]);
  assert.deepEqual(removeEntry(data, "b").entries.map((e) => e.id), ["a"]);
  assert.ok(isJournalData(data));
});

test("isJournalData rechaza datos corruptos", () => {
  assert.equal(isJournalData(null), false);
  assert.equal(isJournalData({ entries: [{ id: 1 }] }), false);
  assert.equal(isJournalData({ entries: [{ ...createEntry(draft, "x", new Date()), intensity: 99 }] }), false);
});

test("buildExport incluye solo las entradas y metadatos de exportación", () => {
  const now = new Date("2026-11-25T10:00:00.000Z");
  const data = addEntry(emptyJournal(), createEntry(draft, "a", now));
  const parsed = JSON.parse(buildExport(data, now));
  assert.deepEqual(Object.keys(parsed).sort(), ["entradas", "exportadoEn", "tipo", "version"]);
  assert.equal(parsed.entradas.length, 1);
});

// --- Higiene digital -----------------------------------------------------------------------

const questions: SelfCheckQuestion[] = [
  { id: "q1", area: "ia", statement: "s", reflection: "r1", suggestedChallengeId: "c1" },
  { id: "q2", area: "ia", statement: "s", reflection: "r2", suggestedChallengeId: "c1" },
  { id: "q3", area: "descanso", statement: "s", reflection: "r3", suggestedChallengeId: "c2" },
];

test("reflectOnAnswers devuelve reflexiones solo para lo frecuente, sin puntuación", () => {
  const reflections = reflectOnAnswers(questions, { q1: "casi-siempre", q2: "a-menudo", q3: "a-veces" });
  assert.deepEqual(reflections.map((r) => r.questionId), ["q1", "q2"]);
  assert.deepEqual(suggestedChallengeIds(reflections), ["c1"]);
  assert.deepEqual(reflectOnAnswers(questions, {}), []);
  for (const reflection of reflections) assert.equal("score" in reflection, false);
});

const weekChallenge: DigitalChallenge = { id: "c7", area: "ia", title: "t", durationDays: 7, description: "d", steps: ["p"] };
const dayChallenge: DigitalChallenge = { ...weekChallenge, id: "c1", durationDays: 1 };

test("startChallenge no duplica un reto activo", () => {
  const now = new Date(2026, 10, 25, 9);
  const once = startChallenge(emptyChallenges(), weekChallenge, now);
  const twice = startChallenge(once, weekChallenge, now);
  assert.equal(twice.items.length, 1);
  assert.ok(isChallengesData(twice));
});

test("checkIn es idempotente por día y termina el reto al completar los días", () => {
  const day1 = new Date(2026, 10, 25, 9);
  let data = startChallenge(emptyChallenges(), dayChallenge, day1);
  data = checkIn(data, "c1", day1);
  data = checkIn(data, "c1", day1);
  assert.equal(data.items[0].checkins.length, 1);
  assert.equal(data.items[0].status, "terminado");
  assert.equal(data.items[0].checkins[0], localDay(day1));
});

test("summarize cuenta días sin penalizar los no marcados", () => {
  const day1 = new Date(2026, 10, 25, 9);
  const day4 = new Date(2026, 10, 28, 22);
  let data = startChallenge(emptyChallenges(), weekChallenge, day1);
  data = checkIn(data, "c7", day1);
  const summary = summarize(data.items[0], day4);
  assert.equal(summary.dayNumber, 4);
  assert.equal(summary.daysMarked, 1);
  assert.equal(summary.markedToday, false);
  assert.equal(summary.periodOver, false);
  assert.equal(summarize(data.items[0], new Date(2026, 11, 3, 9)).periodOver, true);
});

test("leaveChallenge deja el reto sin borrarlo y permite empezarlo de nuevo", () => {
  const now = new Date(2026, 10, 25, 9);
  let data = startChallenge(emptyChallenges(), weekChallenge, now);
  data = leaveChallenge(data, "c7", now);
  assert.equal(data.items[0].status, "dejado");
  data = startChallenge(data, weekChallenge, now);
  assert.equal(data.items.length, 2);
  assert.equal(data.items[0].status, "activo");
});

// --- Resultado de sesión -------------------------------------------------------------------

test("buildPracticeSession: completada, sin puntuar el estado emocional", () => {
  const startedAt = new Date("2026-11-25T10:00:00.000Z");
  const endedAt = new Date("2026-11-25T10:03:00.000Z");
  const result = buildPracticeSession({ id: "u", exerciseId: "bienestar-respiracion", startedAt, endedAt, completed: true, contentId: "4-6" });
  assert.equal(result.module, "bienestar");
  assert.equal(result.outcome, "completada");
  assert.equal(result.trials, 1);
  assert.equal(result.correct, 1);
  assert.equal(result.score, 0);
  assert.equal(result.contentId, "4-6");
  assert.equal(sessionDurationMs(result), 180_000);
});

test("buildPracticeSession: abandonada y fechas invertidas", () => {
  const startedAt = new Date("2026-11-25T10:00:00.000Z");
  const result = buildPracticeSession({ id: "u", exerciseId: "x", startedAt, endedAt: new Date(startedAt.getTime() - 1000), completed: false });
  assert.equal(result.outcome, "abandonada");
  assert.equal(result.correct, 0);
  assert.equal(result.endedAt, result.startedAt);
  assert.equal("contentId" in result, false);
});
