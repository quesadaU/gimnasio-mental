import { test } from "node:test";
import assert from "node:assert/strict";
import type { SessionResult } from "../../../core/types.ts";
import { estadosLecciones, mejorPuntuacion, progresoRuta } from "./progreso.ts";
import { construirSessionResult } from "./sesion.ts";
import type { RutaDefinicion } from "./types.ts";

const ruta: RutaDefinicion = {
  slug: "programacion",
  titulo: "Programación",
  descripcion: "",
  lecciones: [
    { id: "variables", titulo: "Variables", descripcion: "", minutos: 8 },
    { id: "condicionales", titulo: "Condicionales", descripcion: "", minutos: 8 },
    { id: "bucles", titulo: "Bucles", descripcion: "", minutos: 8 },
  ],
};

function sesion(exerciseId: string, score: number, outcome: SessionResult["outcome"] = "completada"): SessionResult {
  return {
    ...construirSessionResult({
      id: `${exerciseId}-${score}`,
      exerciseId,
      contentId: "x",
      startedAt: "2026-11-25T10:00:00.000Z",
      endedAt: "2026-11-25T10:05:00.000Z",
      trials: 10,
      correct: score / 10,
      nivel: 1,
    }),
    outcome,
  };
}

test("progreso por ruta: cuenta lecciones completadas, ignora abandonos y otras rutas", () => {
  const sesiones = [
    sesion("habilidades:programacion:variables", 60),
    sesion("habilidades:programacion:variables", 90),
    sesion("habilidades:programacion:bucles", 50, "abandonada"),
    sesion("habilidades:matematicas:variables", 100),
  ];
  assert.deepEqual(progresoRuta(ruta, sesiones), { completadas: 1, total: 3 });
  assert.deepEqual(estadosLecciones(ruta, sesiones), {
    variables: "completada",
    condicionales: "siguiente",
    bucles: "pendiente",
  });
  assert.equal(mejorPuntuacion(ruta, "variables", sesiones), 90);
  assert.equal(mejorPuntuacion(ruta, "bucles", sesiones), undefined);
});

test("sin sesiones, la primera lección es la siguiente", () => {
  assert.equal(estadosLecciones(ruta, []).variables, "siguiente");
  assert.deepEqual(progresoRuta(ruta, []), { completadas: 0, total: 3 });
});
