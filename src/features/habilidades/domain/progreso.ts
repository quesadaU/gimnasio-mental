/** Progreso por ruta derivado de los eventos SessionResult del store. Puro. */

import type { SessionResult } from "../../../core/types.ts";
import { MODULO, exerciseIdDeLeccion } from "./sesion.ts";
import type { RutaDefinicion } from "./types.ts";

export type EstadoLeccion = "completada" | "siguiente" | "pendiente";

export function leccionesCompletadas(ruta: RutaDefinicion, sesiones: readonly SessionResult[]): Set<string> {
  const completadas = new Set<string>();
  for (const leccion of ruta.lecciones) {
    const exerciseId = exerciseIdDeLeccion(ruta.slug, leccion.id);
    const hecha = sesiones.some(
      (sesion) => sesion.module === MODULO && sesion.exerciseId === exerciseId && sesion.outcome === "completada",
    );
    if (hecha) completadas.add(leccion.id);
  }
  return completadas;
}

export function progresoRuta(
  ruta: RutaDefinicion,
  sesiones: readonly SessionResult[],
): { completadas: number; total: number } {
  return { completadas: leccionesCompletadas(ruta, sesiones).size, total: ruta.lecciones.length };
}

/**
 * Estado de cada lección. No se bloquea ninguna (autonomía), pero se recomienda la primera
 * pendiente en orden, porque el temario está secuenciado de lo simple a lo complejo.
 */
export function estadosLecciones(
  ruta: RutaDefinicion,
  sesiones: readonly SessionResult[],
): Record<string, EstadoLeccion> {
  const completadas = leccionesCompletadas(ruta, sesiones);
  const siguiente = ruta.lecciones.find((leccion) => !completadas.has(leccion.id))?.id;
  return Object.fromEntries(
    ruta.lecciones.map((leccion) => [
      leccion.id,
      completadas.has(leccion.id) ? "completada" : leccion.id === siguiente ? "siguiente" : "pendiente",
    ]),
  );
}

/** Mejor puntuación registrada para una lección, si existe. */
export function mejorPuntuacion(
  ruta: RutaDefinicion,
  leccionId: string,
  sesiones: readonly SessionResult[],
): number | undefined {
  const exerciseId = exerciseIdDeLeccion(ruta.slug, leccionId);
  const puntuaciones = sesiones
    .filter((sesion) => sesion.exerciseId === exerciseId && sesion.outcome === "completada")
    .map((sesion) => sesion.score);
  return puntuaciones.length > 0 ? Math.max(...puntuaciones) : undefined;
}
