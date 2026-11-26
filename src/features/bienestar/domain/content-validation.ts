/**
 * Validación de paquetes de contenido de Bienestar. Devuelve una lista de problemas legibles
 * (vacía si el paquete es correcto). La usan las pruebas y, en el futuro, la carga desde API.
 */

import type { ContentPack } from "../../../core/types.ts";
import type {
  DigitalChallenge,
  EmotionItem,
  GroundingStep,
  MeditationScript,
  ReappraisalPrompt,
  SelfCheckQuestion,
} from "./types.ts";

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Palabras que no deben aparecer en textos de bienestar (promesas clínicas o lenguaje prescriptivo duro). */
const FORBIDDEN_WORDS: readonly string[] = ["cura", "curar", "garantiza", "trastorno", "diagnóstico", "debes", "tienes que"];

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function checkPackShell<T extends { id: string }>(pack: ContentPack<T>): string[] {
  const issues: string[] = [];
  if (!ID_PATTERN.test(pack.id)) issues.push(`id de paquete no válido: ${pack.id}`);
  if (pack.module !== "bienestar") issues.push(`${pack.id}: módulo incorrecto`);
  if (pack.locale !== "es") issues.push(`${pack.id}: locale incorrecto`);
  if (!Number.isInteger(pack.version) || pack.version < 1) issues.push(`${pack.id}: versión no válida`);
  if (!hasText(pack.title)) issues.push(`${pack.id}: falta título`);
  if (pack.items.length === 0) issues.push(`${pack.id}: no tiene ítems`);
  const seen = new Set<string>();
  for (const item of pack.items) {
    if (!ID_PATTERN.test(item.id)) issues.push(`${pack.id}: id de ítem no válido: ${item.id}`);
    if (seen.has(item.id)) issues.push(`${pack.id}: id duplicado: ${item.id}`);
    seen.add(item.id);
  }
  return issues;
}

function checkTone(packId: string, texts: readonly string[]): string[] {
  const issues: string[] = [];
  for (const text of texts) {
    const lower = ` ${text.toLowerCase()} `;
    for (const word of FORBIDDEN_WORDS) {
      if (new RegExp(`[^a-záéíóúñ]${word}[^a-záéíóúñ]`).test(lower)) issues.push(`${packId}: evita "${word}" en "${text.slice(0, 40)}…"`);
    }
  }
  return issues;
}

export function validateMeditationPack(pack: ContentPack<MeditationScript>): string[] {
  const issues = checkPackShell(pack);
  for (const script of pack.items) {
    if (!hasText(script.title) || !hasText(script.intro) || !hasText(script.closing)) issues.push(`${script.id}: faltan textos`);
    if (script.steps.length < 3) issues.push(`${script.id}: necesita al menos 3 pasos`);
    const stepIds = new Set<string>();
    for (const step of script.steps) {
      if (!hasText(step.text)) issues.push(`${script.id}/${step.id}: paso vacío`);
      if (stepIds.has(step.id)) issues.push(`${script.id}: paso duplicado ${step.id}`);
      if (step.weight !== undefined && !(step.weight > 0)) issues.push(`${script.id}/${step.id}: peso no válido`);
      stepIds.add(step.id);
    }
    issues.push(...checkTone(script.id, [script.intro, script.closing, ...script.steps.map((step) => step.text)]));
  }
  return issues;
}

export function validateEmotionPack(pack: ContentPack<EmotionItem>): string[] {
  const issues = checkPackShell(pack);
  const families = new Set(pack.items.map((item) => item.family));
  if (families.size < 5) issues.push(`${pack.id}: debería cubrir al menos 5 familias de emociones`);
  for (const item of pack.items) if (!hasText(item.label)) issues.push(`${item.id}: falta etiqueta`);
  return issues;
}

export function validateReappraisalPack(pack: ContentPack<ReappraisalPrompt>): string[] {
  const issues = checkPackShell(pack);
  for (const item of pack.items) {
    if (!hasText(item.question) || !hasText(item.hint)) issues.push(`${item.id}: faltan textos`);
    issues.push(...checkTone(item.id, [item.question, item.hint]));
  }
  return issues;
}

export function validateGroundingPack(pack: ContentPack<GroundingStep>): string[] {
  const issues = checkPackShell(pack);
  const counts = pack.items.map((item) => item.count).join(",");
  if (counts !== "5,4,3,2,1") issues.push(`${pack.id}: la secuencia debe ser 5-4-3-2-1 (es ${counts})`);
  for (const item of pack.items) if (!hasText(item.sense) || !hasText(item.prompt)) issues.push(`${item.id}: faltan textos`);
  return issues;
}

export function validateSelfCheckPack(
  pack: ContentPack<SelfCheckQuestion>,
  challenges: ContentPack<DigitalChallenge>,
): string[] {
  const issues = checkPackShell(pack);
  const challengeIds = new Set(challenges.items.map((challenge) => challenge.id));
  for (const item of pack.items) {
    if (!hasText(item.statement) || !hasText(item.reflection)) issues.push(`${item.id}: faltan textos`);
    if (!challengeIds.has(item.suggestedChallengeId)) issues.push(`${item.id}: reto sugerido inexistente ${item.suggestedChallengeId}`);
    issues.push(...checkTone(item.id, [item.statement, item.reflection]));
  }
  return issues;
}

export function validateChallengePack(pack: ContentPack<DigitalChallenge>): string[] {
  const issues = checkPackShell(pack);
  for (const item of pack.items) {
    if (item.durationDays !== 1 && item.durationDays !== 7) issues.push(`${item.id}: duración no válida`);
    if (!hasText(item.title) || !hasText(item.description)) issues.push(`${item.id}: faltan textos`);
    if (item.steps.length === 0 || !item.steps.every(hasText)) issues.push(`${item.id}: pasos vacíos`);
    issues.push(...checkTone(item.id, [item.title, item.description, ...item.steps]));
  }
  return issues;
}
