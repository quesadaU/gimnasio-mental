import { test } from "node:test";
import assert from "node:assert/strict";

import meditaciones from "./meditaciones.ts";
import emociones from "./emociones.ts";
import reevaluacion from "./reevaluacion.ts";
import grounding from "./grounding.ts";
import { challengesPack, selfCheckPack } from "./higiene-digital.ts";
import {
  validateChallengePack,
  validateEmotionPack,
  validateGroundingPack,
  validateMeditationPack,
  validateReappraisalPack,
  validateSelfCheckPack,
} from "../../features/bienestar/domain/content-validation.ts";

test("meditaciones válidas e incluyen los guiones usados por las prácticas", () => {
  assert.deepEqual(validateMeditationPack(meditaciones), []);
  const ids = meditaciones.items.map((item) => item.id);
  assert.ok(ids.includes("atencion-respiracion"));
  assert.ok(ids.includes("escaneo-corporal"));
});

test("emociones válidas", () => {
  assert.deepEqual(validateEmotionPack(emociones), []);
});

test("reevaluación válida", () => {
  assert.deepEqual(validateReappraisalPack(reevaluacion), []);
});

test("pausa 5-4-3-2-1 válida", () => {
  assert.deepEqual(validateGroundingPack(grounding), []);
});

test("autoobservación y retos válidos y enlazados", () => {
  assert.deepEqual(validateChallengePack(challengesPack), []);
  assert.deepEqual(validateSelfCheckPack(selfCheckPack, challengesPack), []);
  const days = new Set(challengesPack.items.map((item) => item.durationDays));
  assert.ok(days.has(1) && days.has(7), "debe haber retos de 24 h y de 7 días");
});

test("ids de paquete únicos", () => {
  const ids = [meditaciones, emociones, reevaluacion, grounding, selfCheckPack, challengesPack].map((pack) => pack.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("el validador detecta problemas", () => {
  const broken = { ...grounding, module: "patio" as const, items: [...grounding.items].reverse() };
  const issues = validateGroundingPack(broken);
  assert.ok(issues.some((issue) => issue.includes("módulo")));
  assert.ok(issues.some((issue) => issue.includes("5-4-3-2-1")));
  const promise = { ...reevaluacion, items: [{ id: "x", question: "Esto te cura", hint: "Tienes que hacerlo" }] };
  assert.equal(validateReappraisalPack(promise).length, 2);
});
