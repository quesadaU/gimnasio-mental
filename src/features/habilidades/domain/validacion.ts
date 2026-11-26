/**
 * Validación de paquetes de contenido de Habilidades. Devuelve la lista de problemas
 * (vacía si el paquete es correcto). La usa el test de contenido y servirá como type guard
 * de apoyo cuando el contenido llegue de una API.
 */

import type { ContentPack } from "../../../core/types.ts";
import { analizar, combinaciones, evaluar, sonEquivalentes } from "./expresiones.ts";
import { contarHuecos, corregir, normalizarTexto } from "./correccion.ts";
import type { Ejercicio, Leccion, Respuesta, RutaDefinicion } from "./types.ts";

/** Ids en minúsculas con guiones: sin «:» ni «.», que se usan como separadores de tarjetas. */
export const PATRON_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Segmentos de URL reservados dentro de /habilidades. */
export const SEGMENTOS_RESERVADOS = new Set(["repaso"]);

function duplicados(ids: readonly string[]): string[] {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const id of ids) {
    if (vistos.has(id)) repetidos.add(id);
    vistos.add(id);
  }
  return [...repetidos];
}

/** Respuesta canónica correcta de un ejercicio, para comprobar que el corrector la acepta. */
export function respuestaCorrecta(ejercicio: Ejercicio): Respuesta {
  switch (ejercicio.tipo) {
    case "opcion-multiple":
      return { tipo: "opcion-multiple", opcion: ejercicio.correcta };
    case "numerica":
      return { tipo: "numerica", valor: String(ejercicio.respuesta) };
    case "texto":
      return { tipo: "texto", valor: ejercicio.aceptadas[0] ?? "" };
    case "ordenar":
      return { tipo: "ordenar", orden: ejercicio.pasos.map((paso) => paso.id) };
    case "completar-codigo":
      return { tipo: "completar-codigo", huecos: ejercicio.huecos.map((hueco) => hueco.aceptadas[0] ?? "") };
    case "verdadero-falso":
      return { tipo: "verdadero-falso", valor: ejercicio.esVerdadera, justificacion: ejercicio.justificacionCorrecta };
  }
}

export function validarEjercicio(ejercicio: Ejercicio, donde: string): string[] {
  const errores: string[] = [];
  const e = (mensaje: string) => errores.push(`${donde} (${ejercicio.id}): ${mensaje}`);

  if (!PATRON_ID.test(ejercicio.id)) e("id con formato inválido");
  if (!ejercicio.enunciado.trim()) e("enunciado vacío");
  if (!ejercicio.explicacion.trim()) e("explicación vacía");

  switch (ejercicio.tipo) {
    case "opcion-multiple": {
      if (ejercicio.opciones.length < 2) e("menos de 2 opciones");
      if (duplicados(ejercicio.opciones.map((o) => o.id)).length) e("ids de opción repetidos");
      if (!ejercicio.opciones.some((o) => o.id === ejercicio.correcta)) e("la opción correcta no existe");
      for (const opcion of ejercicio.opciones) {
        if (opcion.id !== ejercicio.correcta && !opcion.retro?.trim()) e(`distractor «${opcion.id}» sin explicación del error`);
      }
      break;
    }
    case "numerica": {
      if (!Number.isFinite(ejercicio.respuesta)) e("respuesta no finita");
      for (const error of ejercicio.erroresComunes ?? []) {
        if (Math.abs(error.valor - ejercicio.respuesta) <= 2 * (ejercicio.tolerancia ?? 0) + 1e-9) {
          e("un error común está dentro de la tolerancia de la respuesta");
        }
      }
      break;
    }
    case "texto": {
      if (ejercicio.aceptadas.length === 0) e("sin respuestas aceptadas");
      const aceptadas = new Set(ejercicio.aceptadas.map(normalizarTexto));
      if (aceptadas.has("")) e("respuesta aceptada vacía tras normalizar");
      for (const error of ejercicio.erroresComunes ?? []) {
        if (aceptadas.has(normalizarTexto(error.respuesta))) e("un error común coincide con una respuesta aceptada");
      }
      break;
    }
    case "ordenar": {
      if (ejercicio.pasos.length < 3) e("menos de 3 pasos");
      if (duplicados(ejercicio.pasos.map((p) => p.id)).length) e("ids de paso repetidos");
      break;
    }
    case "completar-codigo": {
      if (contarHuecos(ejercicio.plantilla) !== ejercicio.huecos.length) e("nº de ___ distinto del nº de huecos");
      ejercicio.huecos.forEach((hueco, indice) => {
        if (hueco.aceptadas.length === 0) e(`hueco ${indice + 1} sin respuestas aceptadas`);
        if (!hueco.equivalencia) return;
        try {
          const arbol = analizar(hueco.aceptadas[0]);
          for (const entorno of combinaciones(hueco.equivalencia)) evaluar(arbol, entorno);
          for (const otra of hueco.aceptadas.slice(1)) {
            const r = sonEquivalentes(hueco.aceptadas[0], otra, hueco.equivalencia);
            if (!r.equivalente) e(`hueco ${indice + 1}: «${otra}» no es equivalente a la referencia`);
          }
        } catch (error) {
          e(`hueco ${indice + 1}: la referencia no se puede evaluar (${(error as Error).message})`);
        }
      });
      break;
    }
    case "verdadero-falso": {
      if (ejercicio.justificaciones.length < 2) e("menos de 2 justificaciones");
      if (duplicados(ejercicio.justificaciones.map((j) => j.id)).length) e("ids de justificación repetidos");
      if (!ejercicio.justificaciones.some((j) => j.id === ejercicio.justificacionCorrecta)) e("la justificación correcta no existe");
      for (const j of ejercicio.justificaciones) {
        if (j.id !== ejercicio.justificacionCorrecta && !j.retro?.trim()) e(`justificación «${j.id}» sin explicación del error`);
      }
      break;
    }
  }

  if (errores.length === 0 && !corregir(ejercicio, respuestaCorrecta(ejercicio)).correcto) {
    e("el corrector no acepta la respuesta canónica");
  }
  return errores;
}

export function validarLeccion(leccion: Leccion, donde: string): string[] {
  const errores: string[] = [];
  const lugar = `${donde}/${leccion.id}`;
  const e = (mensaje: string) => errores.push(`${lugar}: ${mensaje}`);

  if (!PATRON_ID.test(leccion.id)) e("id con formato inválido");
  if (!leccion.titulo.trim() || !leccion.descripcion.trim()) e("título o descripción vacíos");
  if (leccion.minutos < 5 || leccion.minutos > 15) e("duración fuera de 5-15 minutos");
  if (leccion.objetivos.length === 0) e("sin objetivos");
  if (leccion.explicacion.length === 0) e("sin explicación");
  if (leccion.ejemplo.pasos.length === 0) e("ejemplo resuelto sin pasos");
  if (leccion.intento.pistas.length !== 3 || leccion.intento.pistas.some((p) => !p.trim())) e("el intento necesita 3 pistas");
  if (leccion.intento.solucion.length === 0) e("intento sin solución explicada");
  if (leccion.ejercicios.length < 2) e("menos de 2 ejercicios");
  if (leccion.recuperacion.length < 2) e("menos de 2 preguntas de recuperación");
  if (leccion.resumen.length === 0) e("sin resumen");

  const todos = [leccion.intento.ejercicio, ...leccion.ejercicios, ...leccion.recuperacion];
  for (const id of duplicados(todos.map((ej) => ej.id))) e(`id de ejercicio repetido: ${id}`);
  errores.push(...validarEjercicio(leccion.intento.ejercicio, `${lugar}/intento`));
  for (const ej of leccion.ejercicios) errores.push(...validarEjercicio(ej, `${lugar}/ejercicios`));
  for (const ej of leccion.recuperacion) errores.push(...validarEjercicio(ej, `${lugar}/recuperacion`));
  return errores;
}

/** Valida un paquete y su coherencia con el índice del catálogo. */
export function validarPaquete(paquete: ContentPack<Leccion>, ruta: RutaDefinicion): string[] {
  const errores: string[] = [];
  const e = (mensaje: string) => errores.push(`${paquete.id}: ${mensaje}`);

  if (paquete.module !== "habilidades") e("módulo distinto de habilidades");
  if (paquete.id !== ruta.slug) e("el id del paquete no coincide con la ruta");
  if (!PATRON_ID.test(ruta.slug) || SEGMENTOS_RESERVADOS.has(ruta.slug)) e("slug de ruta inválido o reservado");
  if (paquete.items.length < 3 || paquete.items.length > 5) e("la ruta debe tener entre 3 y 5 lecciones");
  for (const id of duplicados(paquete.items.map((l) => l.id))) e(`lección repetida: ${id}`);

  const firma = (l: { id: string; titulo: string; descripcion: string; minutos: number }) =>
    `${l.id}|${l.titulo}|${l.descripcion}|${l.minutos}`;
  if (paquete.items.map(firma).join("\n") !== ruta.lecciones.map(firma).join("\n")) {
    e("el índice del catálogo no coincide con el paquete (id, título, descripción, minutos u orden)");
  }

  for (const leccion of paquete.items) errores.push(...validarLeccion(leccion, paquete.id));
  return errores;
}
