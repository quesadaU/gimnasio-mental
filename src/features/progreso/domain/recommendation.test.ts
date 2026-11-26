import { test } from "node:test";
import assert from "node:assert/strict";
import type { ModuleSlug } from "../../../core/types.ts";
import { recommendNextModule } from "./recommendation.ts";

const TRAINING: ModuleSlug[] = ["patio", "lectura", "habilidades", "bienestar"];

test("sin historial recomienda el primer módulo", () => {
  assert.deepEqual(recommendNextModule([], TRAINING), {
    module: "patio",
    reason: "sin-empezar",
    previousModule: undefined,
  });
});

test("sin módulos de entrenamiento no recomienda nada", () => {
  assert.equal(recommendNextModule([], []), undefined);
});

test("prioriza módulos sin empezar, en orden", () => {
  const result = recommendNextModule(
    [
      { module: "patio", endedAt: "2026-11-20T10:00:00.000Z" },
      { module: "habilidades", endedAt: "2026-11-21T10:00:00.000Z" },
    ],
    TRAINING,
  );
  assert.equal(result?.module, "lectura");
  assert.equal(result?.reason, "sin-empezar");
  assert.equal(result?.previousModule, "habilidades");
});

test("con todo practicado, elige el practicado hace más tiempo (alterna dominios)", () => {
  const result = recommendNextModule(
    [
      { module: "patio", endedAt: "2026-11-24T10:00:00.000Z" },
      { module: "lectura", endedAt: "2026-11-18T10:00:00.000Z" },
      { module: "lectura", endedAt: "2026-11-23T10:00:00.000Z" },
      { module: "habilidades", endedAt: "2026-11-20T10:00:00.000Z" },
      { module: "bienestar", endedAt: "2026-11-22T10:00:00.000Z" },
    ],
    TRAINING,
  );
  assert.deepEqual(result, {
    module: "habilidades",
    reason: "hace-mas-tiempo",
    lastPracticedAt: "2026-11-20T10:00:00.000Z",
    previousModule: "patio",
  });
});

test("ignora sesiones de módulos que no son de entrenamiento", () => {
  const result = recommendNextModule(
    [{ module: "progreso", endedAt: "2026-11-24T10:00:00.000Z" }],
    ["patio"],
  );
  assert.equal(result?.module, "patio");
  assert.equal(result?.previousModule, undefined);
});
