import { test } from "node:test";
import assert from "node:assert/strict";
import { analizar, ErrorExpresion, evaluar, sonEquivalentes } from "./expresiones.ts";

const ev = (fuente: string, entorno: Record<string, number | boolean> = {}) => evaluar(analizar(fuente), entorno);

test("aritmética con precedencia y semántica de Python", () => {
  assert.equal(ev("2 + 3 * 4"), 14);
  assert.equal(ev("(2 + 3) * 4"), 20);
  assert.equal(ev("7 / 2"), 3.5);
  assert.equal(ev("7 // 2"), 3);
  assert.equal(ev("-7 // 2"), -4);
  assert.equal(ev("-7 % 3"), 2);
  assert.equal(ev("2 ** 3 ** 2"), 512);
  assert.equal(ev("-2 ** 2"), -4);
});

test("comparaciones encadenadas y lógica con cortocircuito", () => {
  assert.equal(ev("0 < x < 10", { x: 5 }), true);
  assert.equal(ev("0 < x < 10", { x: 10 }), false);
  assert.equal(ev("not x > 3 and True", { x: 2 }), true);
  assert.equal(ev("x != 0 and 10 / x > 1", { x: 0 }), false); // no evalúa la división
  assert.equal(ev("x == 0 or 10 / x > 1", { x: 0 }), true);
});

test("rechaza todo lo que no es el mini-lenguaje (sin eval posible)", () => {
  for (const malicioso of [
    "alert(1)",
    "constructor.constructor('return 1')()",
    "x.y",
    "x = 3",
    "'texto'",
    "__proto__[0]",
    "1;2",
    "`x`",
    "",
    "(1 + 2",
    "1 +",
  ]) {
    assert.throws(() => analizar(malicioso), ErrorExpresion, malicioso);
  }
  assert.throws(() => analizar("1+".repeat(150)), ErrorExpresion);
  assert.throws(() => analizar("(".repeat(60) + "1" + ")".repeat(60)), ErrorExpresion);
});

test("una variable desconocida es un error, también si se llama como una propiedad de Object", () => {
  assert.throws(() => ev("constructor", {}), ErrorExpresion);
  assert.throws(() => ev("toString + 1", {}), ErrorExpresion);
});

test("sonEquivalentes acepta formas equivalentes y explica la diferencia", () => {
  const dominio = { i: [0, 1, 2, 3, 4, 5, 6, 7] };
  assert.deepEqual(sonEquivalentes("i <= 5", "i < 6", dominio), { equivalente: true });
  assert.deepEqual(sonEquivalentes("i <= 5", "not i > 5", dominio), { equivalente: true });
  const distinta = sonEquivalentes("i <= 5", "i < 5", dominio);
  assert.equal(distinta.equivalente, false);
  if (!distinta.equivalente) assert.match(distinta.motivo, /i = 5/);
});

test("sonEquivalentes rechaza variables fuera del dominio y sintaxis inválida", () => {
  const dominio = { n: [1, 2, 3] };
  const r1 = sonEquivalentes("n % 2 == 0", "m % 2 == 0", dominio);
  assert.equal(r1.equivalente, false);
  const r2 = sonEquivalentes("n % 2 == 0", "n % 2 = 0", dominio);
  assert.equal(r2.equivalente, false);
  if (!r2.equivalente) assert.match(r2.motivo, /No es una expresión válida/);
  const r3 = sonEquivalentes("n % 2 == 0", "constructor", dominio);
  assert.equal(r3.equivalente, false);
});
