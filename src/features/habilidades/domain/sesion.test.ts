import { test } from "node:test";
import assert from "node:assert/strict";
import { SESSION_SCHEMA_VERSION } from "../../../core/types.ts";
import {
  construirSessionResult,
  deckIdDeRuta,
  exerciseIdDeLeccion,
  marcadorVacio,
  puedeVerSolucion,
  puntuacion,
  registrarIntento,
  resumenMarcador,
  siguienteFase,
  verPista,
} from "./sesion.ts";

test("las pistas son graduales y la solución solo se desbloquea tras intentar o agotar las 3", () => {
  let estado = { pistasVistas: 0, intentado: false };
  assert.equal(puedeVerSolucion(estado), false);
  estado = verPista(estado);
  estado = verPista(estado);
  assert.equal(puedeVerSolucion(estado), false);
  estado = verPista(estado);
  assert.equal(puedeVerSolucion(estado), true);
  assert.equal(verPista(estado).pistasVistas, 3);
  assert.equal(puedeVerSolucion({ pistasVistas: 0, intentado: true }), true);
});

test("las fases siguen el ciclo de aprendizaje y se detienen en el resumen", () => {
  assert.equal(siguienteFase("explicacion"), "intento");
  assert.equal(siguienteFase("intento"), "ejercicios");
  assert.equal(siguienteFase("ejercicios"), "recuperacion");
  assert.equal(siguienteFase("recuperacion"), "resumen");
  assert.equal(siguienteFase("resumen"), "resumen");
});

test("ids de mazo y de ejercicio", () => {
  assert.equal(deckIdDeRuta("programacion"), "habilidades:programacion");
  assert.equal(exerciseIdDeLeccion("matematicas", "fracciones"), "habilidades:matematicas:fracciones");
});

test("solo cuenta el primer intento de cada ítem", () => {
  let marcador = registrarIntento(marcadorVacio, "a", false);
  marcador = registrarIntento(marcador, "a", true);
  marcador = registrarIntento(marcador, "b", true);
  marcador = registrarIntento(marcador, "constructor", true);
  assert.deepEqual(resumenMarcador(marcador), { trials: 3, correct: 2 });
  assert.deepEqual(resumenMarcador(marcadorVacio), { trials: 0, correct: 0 });
});

test("construirSessionResult produce un evento completo y acotado", () => {
  const resultado = construirSessionResult({
    id: "00000000-0000-4000-8000-000000000000",
    exerciseId: "habilidades:programacion:variables",
    contentId: "programacion/variables",
    startedAt: "2026-11-25T10:00:00.000Z",
    endedAt: "2026-11-25T10:08:00.000Z",
    trials: 8,
    correct: 6,
    nivel: 2,
  });
  assert.deepEqual(resultado, {
    id: "00000000-0000-4000-8000-000000000000",
    schemaVersion: SESSION_SCHEMA_VERSION,
    exerciseId: "habilidades:programacion:variables",
    module: "habilidades",
    contentId: "programacion/variables",
    startedAt: "2026-11-25T10:00:00.000Z",
    endedAt: "2026-11-25T10:08:00.000Z",
    outcome: "completada",
    difficultyStart: 2,
    difficultyEnd: 2,
    trials: 8,
    correct: 6,
    score: 75,
  });
  const raro = construirSessionResult({ ...resultado, nivel: 1, trials: 2, correct: 5 });
  assert.equal(raro.correct, 2);
  assert.equal(raro.score, 100);
});

test("puntuacion", () => {
  assert.equal(puntuacion(0, 0), 0);
  assert.equal(puntuacion(2, 3), 67);
  assert.equal(puntuacion(5, 5), 100);
});
