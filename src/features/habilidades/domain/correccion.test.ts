import { test } from "node:test";
import assert from "node:assert/strict";
import {
  barajarDeterminista,
  corregir,
  corregirCompletarCodigo,
  corregirNumerico,
  corregirOpcionMultiple,
  corregirOrden,
  corregirTexto,
  corregirVerdaderoFalso,
  interpretarNumero,
  normalizarCodigo,
  normalizarTexto,
} from "./correccion.ts";
import type {
  EjercicioCompletarCodigo,
  EjercicioNumerico,
  EjercicioOpcionMultiple,
  EjercicioOrdenar,
  EjercicioTexto,
  EjercicioVerdaderoFalso,
} from "./types.ts";

test("normalizarTexto ignora mayúsculas, tildes, artículo inicial y puntuación final, pero conserva la ñ", () => {
  assert.equal(normalizarTexto("  La Falacia  del HOMBRE de paja. "), "falacia del hombre de paja");
  assert.equal(normalizarTexto("¿Epistemología?"), "epistemologia");
  assert.equal(normalizarTexto("Año"), "año");
  assert.notEqual(normalizarTexto("año"), normalizarTexto("ano"));
});

test("interpretarNumero admite coma, punto, fracciones, signo y %", () => {
  assert.equal(interpretarNumero("3,5"), 3.5);
  assert.equal(interpretarNumero(" 3.5 "), 3.5);
  assert.equal(interpretarNumero("-2"), -2);
  assert.equal(interpretarNumero("3/4"), 0.75);
  assert.equal(interpretarNumero("25 %"), 25);
  assert.equal(interpretarNumero("1/0"), null);
  assert.equal(interpretarNumero("tres"), null);
  assert.equal(interpretarNumero(""), null);
  assert.equal(interpretarNumero("1e3"), null);
});

test("normalizarCodigo ignora espacios no significativos y unifica comillas", () => {
  assert.equal(normalizarCodigo("print( 'hola' )"), normalizarCodigo('print("hola")'));
  assert.equal(normalizarCodigo("i  <=  5"), "i<=5");
  assert.equal(normalizarCodigo("return x"), "return x");
});

const om: EjercicioOpcionMultiple = {
  tipo: "opcion-multiple",
  id: "om",
  enunciado: "¿?",
  explicacion: "Porque sí.",
  correcta: "b",
  opciones: [
    { id: "a", texto: "A", retro: "Confundes A con B." },
    { id: "b", texto: "B" },
  ],
};

test("opción múltiple: acierto y retro específica del distractor", () => {
  assert.equal(corregirOpcionMultiple(om, "b").correcto, true);
  const fallo = corregirOpcionMultiple(om, "a");
  assert.equal(fallo.correcto, false);
  assert.equal(fallo.retro, "Confundes A con B.");
  assert.equal(fallo.explicacion, "Porque sí.");
  assert.equal(corregirOpcionMultiple(om, "zzz").correcto, false);
});

const numerica: EjercicioNumerico = {
  tipo: "numerica",
  id: "n",
  enunciado: "1/2 + 1/3",
  explicacion: "5/6",
  respuesta: 5 / 6,
  tolerancia: 0.01,
  erroresComunes: [{ valor: 0.4, retro: "Has sumado numeradores y denominadores (2/5)." }],
};

test("numérica: tolerancia, fracción equivalente y error común diagnosticado", () => {
  assert.equal(corregirNumerico(numerica, "5/6").correcto, true);
  assert.equal(corregirNumerico(numerica, "0,83").correcto, true);
  const comun = corregirNumerico(numerica, "2/5");
  assert.equal(comun.correcto, false);
  assert.match(comun.retro, /numeradores/);
  assert.match(corregirNumerico(numerica, "9").retro, /mayor/);
  assert.match(corregirNumerico(numerica, "abc").retro, /No reconozco/);
});

const texto: EjercicioTexto = {
  tipo: "texto",
  id: "t",
  enunciado: "¿Falacia?",
  explicacion: "Es un hombre de paja.",
  aceptadas: ["hombre de paja", "falacia del hombre de paja"],
  erroresComunes: [{ respuesta: "ad hominem", retro: "Ad hominem ataca a la persona, no deforma su argumento." }],
};

test("texto: normaliza y diagnostica errores comunes", () => {
  assert.equal(corregirTexto(texto, "El Hombre de Paja.").correcto, true);
  assert.match(corregirTexto(texto, "Ad Hominem").retro, /ataca a la persona/);
  assert.equal(corregirTexto(texto, "   ").retro, "Escribe una respuesta.");
});

const orden: EjercicioOrdenar = {
  tipo: "ordenar",
  id: "o",
  enunciado: "Ordena",
  explicacion: "Así.",
  pasos: [
    { id: "p1", texto: "Uno" },
    { id: "p2", texto: "Dos" },
    { id: "p3", texto: "Tres" },
  ],
};

test("ordenar: indica cuántos están bien y el primer desajuste", () => {
  assert.equal(corregirOrden(orden, ["p1", "p2", "p3"]).correcto, true);
  const fallo = corregirOrden(orden, ["p1", "p3", "p2"]);
  assert.equal(fallo.correcto, false);
  assert.match(fallo.retro, /1 de 3/);
  assert.match(fallo.retro, /posición 2/);
  assert.equal(corregirOrden(orden, ["p1", "p2"]).correcto, false);
  assert.equal(corregirOrden(orden, ["p1", "p1", "p2"]).correcto, false);
});

const codigo: EjercicioCompletarCodigo = {
  tipo: "completar-codigo",
  id: "c",
  enunciado: "Imprime del 1 al 5",
  explicacion: "range excluye el final.",
  plantilla: "i = 1\nwhile ___:\n    print(i)\n    i = ___",
  huecos: [
    { aceptadas: ["i <= 5"], equivalencia: { i: [0, 1, 2, 3, 4, 5, 6, 7] }, retro: "El bucle debe incluir el 5." },
    { aceptadas: ["i + 1", "1 + i"], equivalencia: { i: [0, 1, 2, 3] } },
  ],
};

test("completar código: comparación normalizada y equivalencia semántica segura", () => {
  assert.equal(corregirCompletarCodigo(codigo, ["i<=5", "i+1"]).correcto, true);
  assert.equal(corregirCompletarCodigo(codigo, ["i < 6", "1 + i"]).correcto, true);
  const fallo = corregirCompletarCodigo(codigo, ["i < 5", "i + 1"]);
  assert.equal(fallo.correcto, false);
  assert.deepEqual(fallo.huecos, [false, true]);
  assert.match(fallo.retro, /Hueco 1/);
  assert.match(fallo.retro, /incluir el 5/);
  const malicioso = corregirCompletarCodigo(codigo, ["globalThis.process.exit()", "i + 1"]);
  assert.equal(malicioso.correcto, false);
  assert.equal(corregirCompletarCodigo(codigo, ["", ""]).correcto, false);
});

const vf: EjercicioVerdaderoFalso = {
  tipo: "verdadero-falso",
  id: "vf",
  enunciado: "Un argumento válido puede tener conclusión falsa.",
  explicacion: "La validez depende de la forma.",
  esVerdadera: true,
  justificacionCorrecta: "j1",
  justificaciones: [
    { id: "j1", texto: "Si alguna premisa es falsa." },
    { id: "j2", texto: "La validez garantiza la verdad.", retro: "Eso es la solidez, no la validez." },
  ],
};

test("verdadero/falso exige valor y justificación", () => {
  assert.equal(corregirVerdaderoFalso(vf, true, "j1").correcto, true);
  const soloValor = corregirVerdaderoFalso(vf, true, "j2");
  assert.equal(soloValor.correcto, false);
  assert.match(soloValor.retro, /justificación no lo explica/);
  assert.match(corregirVerdaderoFalso(vf, false, "j2").retro, /es verdadera/);
  assert.match(corregirVerdaderoFalso(vf, true, "").retro, /Elige también/);
});

test("corregir despacha por tipo y rechaza respuestas de otro tipo", () => {
  assert.equal(corregir(om, { tipo: "opcion-multiple", opcion: "b" }).correcto, true);
  assert.equal(corregir(om, { tipo: "texto", valor: "b" }).correcto, false);
  assert.equal(corregir(vf, { tipo: "verdadero-falso", valor: true, justificacion: "j1" }).correcto, true);
});

test("barajarDeterminista: estable, permutación y nunca el orden original", () => {
  const base = ["a", "b", "c", "d"];
  const una = barajarDeterminista(base, "semilla");
  assert.deepEqual(una, barajarDeterminista(base, "semilla"));
  assert.deepEqual([...una].sort(), base);
  for (let i = 0; i < 50; i++) {
    assert.notDeepEqual(barajarDeterminista(["x", "y"], `s${i}`), ["x", "y"]);
    assert.notDeepEqual(barajarDeterminista(base, `s${i}`), base);
  }
  assert.deepEqual(barajarDeterminista(["solo"], "s"), ["solo"]);
});
