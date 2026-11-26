import { test } from "node:test";
import assert from "node:assert/strict";
import { createCard } from "../../../core/spaced-repetition.ts";
import type { ReviewCard } from "../../../core/types.ts";
import {
  actualDeCola,
  calificarTarjeta,
  cardIdDePregunta,
  colaTerminada,
  crearCola,
  intercalarPorMazo,
  LIMITE_REPASO,
  MAX_REINTENTOS,
  responderCola,
  seleccionarRepaso,
  separarCardId,
  tarjetasCalificadas,
} from "./repaso.ts";

const ahora = new Date("2026-11-25T10:00:00.000Z");

test("ids de tarjeta: construir y separar", () => {
  const id = cardIdDePregunta("habilidades:programacion", "bucles", "r1");
  assert.equal(id, "habilidades:programacion:bucles.r1");
  assert.deepEqual(separarCardId(id), { deckId: "habilidades:programacion", itemId: "bucles.r1" });
});

test("calificarTarjeta crea la tarjeta la primera vez y aplica Leitner", () => {
  const nueva = calificarTarjeta(undefined, "habilidades:artes", "color.r1", true, ahora);
  assert.equal(nueva.id, "habilidades:artes:color.r1");
  assert.equal(nueva.box, 2);
  assert.equal(nueva.reviews, 1);
  const fallada = calificarTarjeta(nueva, "habilidades:artes", "color.r1", false, ahora);
  assert.equal(fallada.box, 1);
  assert.equal(fallada.lapses, 1);
});

test("intercalarPorMazo alterna rutas y conserva el orden interno", () => {
  const t = (deckId: string, n: number) => ({ deckId, n });
  const ordenado = intercalarPorMazo([t("a", 1), t("a", 2), t("a", 3), t("b", 1), t("c", 1), t("b", 2)]);
  assert.deepEqual(
    ordenado.map((x) => `${x.deckId}${x.n}`),
    ["a1", "b1", "c1", "a2", "b2", "a3"],
  );
  assert.deepEqual(intercalarPorMazo([]), []);
});

function tarjeta(deckId: string, item: string, dueAt: string): ReviewCard {
  return { ...createCard(deckId, item, ahora), dueAt };
}

test("seleccionarRepaso: solo vencidas con contenido, máximo 20 e intercaladas", () => {
  const tarjetas: ReviewCard[] = [];
  for (let i = 0; i < 15; i++) tarjetas.push(tarjeta("habilidades:a", `l.r${i}`, "2026-11-20T00:00:00.000Z"));
  for (let i = 0; i < 15; i++) tarjetas.push(tarjeta("habilidades:b", `l.r${i}`, "2026-11-21T00:00:00.000Z"));
  tarjetas.push(tarjeta("habilidades:a", "futura.r1", "2026-12-01T00:00:00.000Z"));
  tarjetas.push(tarjeta("habilidades:a", "huerfana.r1", "2026-11-01T00:00:00.000Z"));
  const disponibles = new Set(tarjetas.filter((x) => !x.id.includes("huerfana")).map((x) => x.id));

  const seleccion = seleccionarRepaso(tarjetas, ahora, disponibles);
  assert.equal(seleccion.length, LIMITE_REPASO);
  assert.ok(seleccion.every((x) => !x.id.includes("futura") && !x.id.includes("huerfana")));
  assert.equal(seleccion[0].deckId, "habilidades:a");
  assert.equal(seleccion[1].deckId, "habilidades:b");
  assert.equal(seleccionarRepaso([], ahora, disponibles).length, 0);
});

test("la cola reencola los fallos y califica solo el primer intento", () => {
  let cola = crearCola(["x", "y"]);
  assert.equal(actualDeCola(cola), "x");
  cola = responderCola(cola, false); // x falla: vuelve al final
  assert.deepEqual(cola.pendientes, ["y", "x"]);
  cola = responderCola(cola, true); // y
  cola = responderCola(cola, true); // x acierta en el reintento
  assert.equal(colaTerminada(cola), true);
  assert.deepEqual(cola.primerIntento, { x: false, y: true });
});

test("la cola no repite un fallo indefinidamente", () => {
  let cola = crearCola(["x"]);
  for (let i = 0; i <= MAX_REINTENTOS; i++) cola = responderCola(cola, false);
  assert.equal(colaTerminada(cola), true);
  assert.equal(responderCola(cola, true), cola);
});

test("tarjetasCalificadas usa la tarjeta existente si la hay", () => {
  const existente = { ...createCard("habilidades:a", "l.r1", ahora), box: 3 };
  let cola = crearCola(["habilidades:a:l.r1", "habilidades:b:l.r2"]);
  cola = responderCola(cola, true);
  cola = responderCola(cola, false);
  const tarjetas = tarjetasCalificadas(cola, [existente], separarCardId, ahora);
  const porId = Object.fromEntries(tarjetas.map((x) => [x.id, x]));
  assert.equal(porId["habilidades:a:l.r1"].box, 4);
  assert.equal(porId["habilidades:b:l.r2"].box, 1);
  assert.equal(porId["habilidades:b:l.r2"].deckId, "habilidades:b");
});
