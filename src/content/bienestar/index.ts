/**
 * Cargadores diferidos del contenido de Bienestar: cada paquete sale como un chunk aparte y
 * solo se descarga al entrar en la práctica que lo usa.
 */

import type { ContentLoader } from "@/core/types";
import type {
  DigitalChallenge,
  EmotionItem,
  GroundingStep,
  MeditationScript,
  ReappraisalPrompt,
  SelfCheckQuestion,
} from "@/features/bienestar/domain/types";

export const meditationLoaders: Record<string, ContentLoader<MeditationScript>> = {
  "meditaciones-basicas": () => import("./meditaciones").then((module) => module.default),
};

export const emotionLoaders: Record<string, ContentLoader<EmotionItem>> = {
  "emociones-basicas": () => import("./emociones").then((module) => module.default),
};

export const reappraisalLoaders: Record<string, ContentLoader<ReappraisalPrompt>> = {
  "reevaluacion-guiada": () => import("./reevaluacion").then((module) => module.default),
};

export const groundingLoaders: Record<string, ContentLoader<GroundingStep>> = {
  "pausa-5-4-3-2-1": () => import("./grounding").then((module) => module.default),
};

export const selfCheckLoaders: Record<string, ContentLoader<SelfCheckQuestion>> = {
  "autoobservacion-digital": () => import("./higiene-digital").then((module) => module.selfCheckPack),
};

export const challengeLoaders: Record<string, ContentLoader<DigitalChallenge>> = {
  "micro-retos-digitales": () => import("./higiene-digital").then((module) => module.challengesPack),
};
