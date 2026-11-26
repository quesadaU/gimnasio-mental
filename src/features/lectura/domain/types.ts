/**
 * Tipos del dominio de Lectura. TypeScript puro: sin React, Next ni DOM.
 * Los ids de textos, preguntas e ideas son estables: las tarjetas de repaso y las sesiones los referencian.
 */

export type ReadingTopic =
  | "atencion"
  | "memoria"
  | "pensamiento-critico"
  | "filosofia"
  | "ciencia"
  | "literatura";

export type ReadingLevel = "inicial" | "intermedio" | "avanzado";

/**
 * Tipo de pregunta según el nivel de comprensión que exige:
 * - literal: la respuesta está escrita en el texto;
 * - inferencial: hay que relacionar ideas o deducir lo que no se dice explícitamente;
 * - vocabulario: significado de una palabra o expresión en su contexto;
 * - estructura: cómo está organizado el texto o qué función cumple una parte.
 */
export type QuestionKind = "literal" | "inferencial" | "vocabulario" | "estructura";

export interface ReadingQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
  /** Explica por qué la respuesta correcta lo es (y, si ayuda, por qué fallan las otras). */
  explanation: string;
}

/** Idea clave que entra en la repetición espaciada: una pregunta de recuperación y su respuesta. */
export interface KeyIdea {
  id: string;
  prompt: string;
  answer: string;
}

export type SourceKind = "original" | "dominio-publico";

export interface ReadingSource {
  kind: SourceKind;
  author: string;
  /** Obra de la que procede el fragmento (obligatoria en dominio público). */
  work?: string;
  year?: string;
  license: string;
  /** Edición o repositorio de referencia para cotejar el texto. */
  reference?: string;
  /** Aclaraciones editoriales: fragmento abreviado, ortografía, etc. */
  note?: string;
}

export interface ReadingText {
  id: string;
  title: string;
  summary: string;
  topic: ReadingTopic;
  level: ReadingLevel;
  /** Número de palabras del cuerpo; debe coincidir con `countWords(paragraphs)`. */
  words: number;
  source: ReadingSource;
  /** "verso" conserva los saltos de línea (`\n`) de cada estrofa. Por defecto, prosa. */
  form?: "prosa" | "verso";
  /** Párrafos en prosa o estrofas en verso. */
  paragraphs: readonly string[];
  /** Referencias de las afirmaciones científicas de los textos originales, para quien quiera ampliar. */
  references?: readonly string[];
  questions: readonly ReadingQuestion[];
  keyIdeas: readonly KeyIdea[];
}

/** Metadatos ligeros para la biblioteca: no incluyen el cuerpo, que se carga de forma diferida. */
export type ReadingTextMeta = Pick<
  ReadingText,
  "id" | "title" | "summary" | "topic" | "level" | "words"
> & { sourceKind: SourceKind; author: string };

export const TOPIC_LABELS: Readonly<Record<ReadingTopic, string>> = {
  atencion: "Atención",
  memoria: "Memoria",
  "pensamiento-critico": "Pensamiento crítico",
  filosofia: "Filosofía",
  ciencia: "Ciencia",
  literatura: "Literatura",
};

export const LEVEL_LABELS: Readonly<Record<ReadingLevel, string>> = {
  inicial: "Inicial",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export const QUESTION_KIND_LABELS: Readonly<Record<QuestionKind, string>> = {
  literal: "Literal",
  inferencial: "Inferencial",
  vocabulario: "Vocabulario",
  estructura: "Estructura",
};
