/** Validación de paquetes de textos. La usan las pruebas del contenido (y en el futuro, la carga desde API). */

import type { ContentPack } from "../../../core/types.ts";
import { countWords } from "./reading-estimate.ts";
import { LEVEL_LABELS, TOPIC_LABELS, type ReadingText } from "./types.ts";

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 5;
/** Segmentos estáticos bajo /lectura que no pueden usarse como id de texto. */
export const RESERVED_TEXT_IDS: readonly string[] = ["repaso"];

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateReadingText(text: ReadingText): string[] {
  const errors: string[] = [];
  const where = `texto ${text.id || "(sin id)"}`;

  if (!ID_PATTERN.test(text.id)) errors.push(`${where}: id no es kebab-case`);
  if (RESERVED_TEXT_IDS.includes(text.id)) errors.push(`${where}: id reservado`);
  if (!text.title.trim()) errors.push(`${where}: falta el título`);
  if (!text.summary.trim()) errors.push(`${where}: falta el resumen`);
  if (!(text.topic in TOPIC_LABELS)) errors.push(`${where}: tema desconocido`);
  if (!(text.level in LEVEL_LABELS)) errors.push(`${where}: nivel desconocido`);
  if (text.paragraphs.length === 0 || text.paragraphs.some((p) => !p.trim())) {
    errors.push(`${where}: cuerpo vacío o con párrafos vacíos`);
  }
  const counted = countWords(text.paragraphs);
  if (text.words !== counted) errors.push(`${where}: words=${text.words} pero cuenta ${counted}`);

  const { source } = text;
  if (!source.license.trim()) errors.push(`${where}: falta la licencia`);
  if (!source.author.trim()) errors.push(`${where}: falta el autor`);
  if (source.kind === "dominio-publico" && (!source.work?.trim() || !source.reference?.trim())) {
    errors.push(`${where}: un texto de dominio público necesita obra y referencia`);
  }

  const { questions } = text;
  if (questions.length < MIN_QUESTIONS || questions.length > MAX_QUESTIONS) {
    errors.push(`${where}: necesita entre ${MIN_QUESTIONS} y ${MAX_QUESTIONS} preguntas`);
  }
  if (!questions.some((q) => q.kind === "inferencial")) {
    errors.push(`${where}: necesita al menos una pregunta inferencial`);
  }
  const questionIds = new Set<string>();
  for (const question of questions) {
    if (!ID_PATTERN.test(question.id)) errors.push(`${where}: id de pregunta inválido ${question.id}`);
    if (questionIds.has(question.id)) errors.push(`${where}: pregunta duplicada ${question.id}`);
    questionIds.add(question.id);
    if (question.options.length < 2) errors.push(`${where}: ${question.id} tiene menos de 2 opciones`);
    if (new Set(question.options).size !== question.options.length) {
      errors.push(`${where}: ${question.id} tiene opciones repetidas`);
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      errors.push(`${where}: ${question.id} tiene la respuesta correcta fuera de rango`);
    }
    if (!question.prompt.trim() || !question.explanation.trim()) {
      errors.push(`${where}: ${question.id} sin enunciado o sin explicación`);
    }
  }

  if (text.keyIdeas.length === 0) errors.push(`${where}: necesita ideas clave`);
  const ideaIds = new Set<string>();
  for (const idea of text.keyIdeas) {
    if (!ID_PATTERN.test(idea.id)) errors.push(`${where}: id de idea inválido ${idea.id}`);
    if (ideaIds.has(idea.id)) errors.push(`${where}: idea duplicada ${idea.id}`);
    ideaIds.add(idea.id);
    if (!idea.prompt.trim() || !idea.answer.trim()) errors.push(`${where}: idea ${idea.id} incompleta`);
  }

  return errors;
}

export function validateReadingPack(pack: ContentPack<ReadingText>): string[] {
  const errors: string[] = [];
  if (pack.module !== "lectura") errors.push(`paquete ${pack.id}: módulo distinto de lectura`);
  if (pack.locale !== "es") errors.push(`paquete ${pack.id}: locale distinto de es`);
  if (!Number.isInteger(pack.version) || pack.version < 1) errors.push(`paquete ${pack.id}: versión inválida`);
  if (pack.items.length === 0) errors.push(`paquete ${pack.id}: sin textos`);
  for (const text of pack.items) errors.push(...validateReadingText(text));
  return errors;
}
