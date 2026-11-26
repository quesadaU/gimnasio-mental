/**
 * Tipos del módulo Bienestar. TypeScript puro: sin React, Next ni APIs del navegador.
 * Los paquetes de `src/content/bienestar` se tipan con estos modelos.
 */

export type PracticeCategory = "calmar-el-cuerpo" | "atencion-plena" | "emociones" | "higiene-digital";

export const PRACTICE_CATEGORIES: readonly { id: PracticeCategory; title: string; description: string }[] = [
  {
    id: "calmar-el-cuerpo",
    title: "Calmar el cuerpo",
    description: "Respiración lenta y pausas breves para bajar el ritmo cuando lo necesites.",
  },
  {
    id: "atencion-plena",
    title: "Atención plena",
    description: "Guiones sencillos para practicar llevar la atención al presente, sin juzgarte.",
  },
  {
    id: "emociones",
    title: "Emociones",
    description: "Ponerle nombre a lo que sientes y mirar la situación desde otro ángulo.",
  },
  {
    id: "higiene-digital",
    title: "Higiene digital",
    description: "Observar tus hábitos con pantallas e IA y probar pequeños cambios.",
  },
];

/** Paso de un guion de meditación. `weight` reparte el tiempo total entre pasos (por defecto 1). */
export interface MeditationStep {
  id: string;
  text: string;
  weight?: number;
}

export interface MeditationScript {
  id: string;
  title: string;
  intro: string;
  steps: readonly MeditationStep[];
  closing: string;
}

export type EmotionFamily = "alegria" | "tristeza" | "miedo" | "enfado" | "calma" | "sorpresa" | "verguenza";

/** Orden de presentación de las familias en el selector. */
export const EMOTION_FAMILIES: readonly { id: EmotionFamily; label: string }[] = [
  { id: "alegria", label: "Alegría" },
  { id: "calma", label: "Calma y energía" },
  { id: "tristeza", label: "Tristeza" },
  { id: "miedo", label: "Miedo" },
  { id: "enfado", label: "Enfado" },
  { id: "sorpresa", label: "Sorpresa" },
  { id: "verguenza", label: "Vergüenza y culpa" },
];

export interface EmotionItem {
  id: string;
  label: string;
  family: EmotionFamily;
}

export interface ReappraisalPrompt {
  id: string;
  question: string;
  hint: string;
}

export interface GroundingStep {
  id: string;
  count: number;
  sense: string;
  prompt: string;
}

export type DigitalArea = "desplazamiento" | "ia" | "descanso" | "atencion";

export type FrequencyAnswer = "nunca" | "a-veces" | "a-menudo" | "casi-siempre";

export const FREQUENCY_OPTIONS: readonly { id: FrequencyAnswer; label: string }[] = [
  { id: "nunca", label: "Casi nunca" },
  { id: "a-veces", label: "A veces" },
  { id: "a-menudo", label: "A menudo" },
  { id: "casi-siempre", label: "Casi siempre" },
];

export interface SelfCheckQuestion {
  id: string;
  area: DigitalArea;
  statement: string;
  /** Reflexión que se muestra si la respuesta es "a menudo" o "casi siempre". */
  reflection: string;
  suggestedChallengeId: string;
}

export interface DigitalChallenge {
  id: string;
  area: DigitalArea;
  title: string;
  durationDays: 1 | 7;
  description: string;
  steps: readonly string[];
}
