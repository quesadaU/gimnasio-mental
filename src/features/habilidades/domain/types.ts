/**
 * Tipos del módulo Habilidades. TypeScript puro: sin React, Next ni APIs del navegador.
 * El contenido (src/content/habilidades) se tipa contra estos contratos.
 */

import type { DifficultyLevel } from "../../../core/types.ts";

export type RutaSlug =
  | "programacion"
  | "matematicas"
  | "filosofia"
  | "artes"
  | "pensamiento-critico";

interface EjercicioBase {
  /** Estable una vez publicado: lo referencian tarjetas y sesiones. */
  id: string;
  enunciado: string;
  /** Fragmento de código o notación que acompaña al enunciado (se muestra tal cual, nunca se ejecuta). */
  codigo?: string;
  /** Explicación de la respuesta correcta; se muestra siempre tras corregir. */
  explicacion: string;
}

export interface Opcion {
  id: string;
  texto: string;
  /** Por qué esta opción es incorrecta (concepción errónea típica). Solo en distractores. */
  retro?: string;
}

export interface EjercicioOpcionMultiple extends EjercicioBase {
  tipo: "opcion-multiple";
  opciones: readonly Opcion[];
  correcta: string;
}

export interface ErrorComunNumerico {
  valor: number;
  retro: string;
}

export interface EjercicioNumerico extends EjercicioBase {
  tipo: "numerica";
  respuesta: number;
  /** Diferencia absoluta admitida. 0 por defecto. */
  tolerancia?: number;
  unidad?: string;
  erroresComunes?: readonly ErrorComunNumerico[];
}

export interface ErrorComunTexto {
  respuesta: string;
  retro: string;
}

export interface EjercicioTexto extends EjercicioBase {
  tipo: "texto";
  /** Respuestas aceptadas; se comparan normalizadas (mayúsculas, tildes, espacios, artículos). */
  aceptadas: readonly string[];
  erroresComunes?: readonly ErrorComunTexto[];
}

export interface Paso {
  id: string;
  texto: string;
}

export interface EjercicioOrdenar extends EjercicioBase {
  tipo: "ordenar";
  /** En el orden correcto. La UI los presenta barajados de forma determinista. */
  pasos: readonly Paso[];
}

/** Dominio de prueba para comprobar equivalencia semántica de una expresión del mini-lenguaje. */
export type DominioVariables = Readonly<Record<string, readonly number[]>>;

export interface Hueco {
  /** Respuestas aceptadas; se comparan con normalización de código (espacios y comillas). */
  aceptadas: readonly string[];
  /**
   * Si existe, también se acepta cualquier expresión equivalente a la primera aceptada,
   * evaluada con el intérprete propio y seguro (nunca eval) sobre todas las combinaciones.
   */
  equivalencia?: DominioVariables;
  /** Explicación específica si este hueco falla. */
  retro?: string;
}

export interface EjercicioCompletarCodigo extends EjercicioBase {
  tipo: "completar-codigo";
  /** Código con tantos marcadores `___` como huecos. */
  plantilla: string;
  huecos: readonly Hueco[];
}

export interface EjercicioVerdaderoFalso extends EjercicioBase {
  tipo: "verdadero-falso";
  esVerdadera: boolean;
  /** Justificaciones candidatas: hay que elegir la que explica el valor de verdad. */
  justificaciones: readonly Opcion[];
  justificacionCorrecta: string;
}

export type Ejercicio =
  | EjercicioOpcionMultiple
  | EjercicioNumerico
  | EjercicioTexto
  | EjercicioOrdenar
  | EjercicioCompletarCodigo
  | EjercicioVerdaderoFalso;

export type TipoEjercicio = Ejercicio["tipo"];

/** Respuesta de la persona, según el tipo de ejercicio. */
export type Respuesta =
  | { tipo: "opcion-multiple"; opcion: string }
  | { tipo: "numerica"; valor: string }
  | { tipo: "texto"; valor: string }
  | { tipo: "ordenar"; orden: readonly string[] }
  | { tipo: "completar-codigo"; huecos: readonly string[] }
  | { tipo: "verdadero-falso"; valor: boolean; justificacion: string };

export interface Correccion {
  correcto: boolean;
  /** Mensaje específico sobre la respuesta dada (qué falló y por qué). */
  retro: string;
  /** Explicación general de la respuesta correcta. */
  explicacion: string;
}

export interface EjemploResuelto {
  enunciado: string;
  codigo?: string;
  pasos: readonly string[];
}

export interface Intento {
  ejercicio: Ejercicio;
  /** Exactamente 3 niveles: orientación, concreción, casi el paso clave. */
  pistas: readonly [string, string, string];
  /** Solución explicada paso a paso; solo visible tras intentar o agotar las pistas. */
  solucion: readonly string[];
}

export interface Leccion {
  id: string;
  titulo: string;
  descripcion: string;
  nivel: DifficultyLevel;
  minutos: number;
  objetivos: readonly string[];
  explicacion: readonly string[];
  ejemplo: EjemploResuelto;
  intento: Intento;
  ejercicios: readonly Ejercicio[];
  /** Preguntas de recuperación: alimentan el mazo Leitner `habilidades:<ruta>`. */
  recuperacion: readonly Ejercicio[];
  resumen: readonly string[];
}

export interface LeccionIndice {
  id: string;
  titulo: string;
  descripcion: string;
  minutos: number;
}

export interface RutaDefinicion {
  slug: RutaSlug;
  titulo: string;
  descripcion: string;
  /** Índice ligero para catálogo y temario; debe coincidir con el paquete (lo valida un test). */
  lecciones: readonly LeccionIndice[];
}
