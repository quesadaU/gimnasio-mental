import { test } from "node:test";
import assert from "node:assert/strict";
import type { ContentPack } from "../../../core/types.ts";
import { RUTAS } from "../../../content/habilidades/catalogo.ts";
import programacion from "../../../content/habilidades/programacion/pack.ts";
import matematicas from "../../../content/habilidades/matematicas/pack.ts";
import filosofia from "../../../content/habilidades/filosofia/pack.ts";
import artes from "../../../content/habilidades/artes/pack.ts";
import pensamientoCritico from "../../../content/habilidades/pensamiento-critico/pack.ts";
import { corregir } from "./correccion.ts";
import { cardIdDePregunta, separarCardId } from "./repaso.ts";
import { deckIdDeRuta } from "./sesion.ts";
import type { Leccion } from "./types.ts";
import { PATRON_ID, respuestaCorrecta, validarPaquete } from "./validacion.ts";

const PAQUETES: Record<string, ContentPack<Leccion>> = {
  programacion,
  matematicas,
  filosofia,
  artes,
  "pensamiento-critico": pensamientoCritico,
};

test("hay exactamente 5 rutas, con slugs únicos y un paquete por ruta", () => {
  assert.equal(RUTAS.length, 5);
  assert.equal(new Set(RUTAS.map((r) => r.slug)).size, 5);
  for (const ruta of RUTAS) assert.ok(PAQUETES[ruta.slug], `falta el paquete de ${ruta.slug}`);
});

for (const ruta of RUTAS) {
  test(`paquete ${ruta.slug}: ids únicos, respuestas válidas, pistas y coherencia con el catálogo`, () => {
    assert.deepEqual(validarPaquete(PAQUETES[ruta.slug], ruta), []);
  });
}

test("los ids de tarjeta de todo el contenido son únicos y reversibles", () => {
  const vistos = new Set<string>();
  for (const ruta of RUTAS) {
    const deckId = deckIdDeRuta(ruta.slug);
    for (const leccion of PAQUETES[ruta.slug].items) {
      for (const pregunta of leccion.recuperacion) {
        const id = cardIdDePregunta(deckId, leccion.id, pregunta.id);
        assert.ok(!vistos.has(id), `tarjeta repetida ${id}`);
        vistos.add(id);
        assert.equal(separarCardId(id).deckId, deckId);
      }
    }
  }
  assert.ok(vistos.size >= 40);
});

test("ningún distractor de opción múltiple ni justificación incorrecta se acepta como correcto", () => {
  for (const paquete of Object.values(PAQUETES)) {
    for (const leccion of paquete.items) {
      for (const ej of [leccion.intento.ejercicio, ...leccion.ejercicios, ...leccion.recuperacion]) {
        assert.ok(PATRON_ID.test(ej.id));
        assert.equal(corregir(ej, respuestaCorrecta(ej)).correcto, true, `${leccion.id}/${ej.id}`);
        if (ej.tipo === "opcion-multiple") {
          for (const opcion of ej.opciones.filter((o) => o.id !== ej.correcta)) {
            assert.equal(corregir(ej, { tipo: "opcion-multiple", opcion: opcion.id }).correcto, false);
          }
        }
        if (ej.tipo === "verdadero-falso") {
          assert.equal(
            corregir(ej, { tipo: "verdadero-falso", valor: !ej.esVerdadera, justificacion: ej.justificacionCorrecta }).correcto,
            false,
          );
        }
        if (ej.tipo === "numerica") {
          for (const error of ej.erroresComunes ?? []) {
            const r = corregir(ej, { tipo: "numerica", valor: String(error.valor) });
            assert.equal(r.correcto, false);
            assert.equal(r.retro, error.retro, `${leccion.id}/${ej.id}: el error común no se diagnostica`);
          }
        }
        if (ej.tipo === "texto") {
          for (const error of ej.erroresComunes ?? []) {
            const r = corregir(ej, { tipo: "texto", valor: error.respuesta });
            assert.equal(r.correcto, false);
            assert.equal(r.retro, error.retro);
          }
        }
      }
    }
  }
});

test("el validador detecta paquetes defectuosos", () => {
  const ruta = RUTAS[0];
  const original = PAQUETES[ruta.slug];
  const [primera, ...resto] = original.items;
  const rota: Leccion = {
    ...primera,
    intento: { ...primera.intento, pistas: ["", "b", "c"] },
    ejercicios: [
      { ...primera.ejercicios[0], id: "repetido" },
      { ...primera.ejercicios[1], id: "repetido" },
    ],
  };
  const errores = validarPaquete({ ...original, items: [rota, ...resto] }, ruta);
  assert.ok(errores.some((e) => e.includes("3 pistas")));
  assert.ok(errores.some((e) => e.includes("repetido")));
});
