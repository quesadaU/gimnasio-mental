import type { ContentPack } from "@/core/types";
import type { EmotionItem } from "@/features/bienestar/domain/types";

/** Vocabulario emocional cotidiano (no clínico) agrupado por familias para facilitar el etiquetado. */
const pack: ContentPack<EmotionItem> = {
  id: "emociones-basicas",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Emociones",
  items: [
    { id: "alegria", label: "Alegría", family: "alegria" },
    { id: "gratitud", label: "Gratitud", family: "alegria" },
    { id: "ilusion", label: "Ilusión", family: "alegria" },
    { id: "orgullo", label: "Orgullo", family: "alegria" },
    { id: "alivio", label: "Alivio", family: "alegria" },
    { id: "tranquilidad", label: "Tranquilidad", family: "calma" },
    { id: "confianza", label: "Confianza", family: "calma" },
    { id: "cansancio", label: "Cansancio", family: "calma" },
    { id: "tristeza", label: "Tristeza", family: "tristeza" },
    { id: "soledad", label: "Soledad", family: "tristeza" },
    { id: "decepcion", label: "Decepción", family: "tristeza" },
    { id: "nostalgia", label: "Nostalgia", family: "tristeza" },
    { id: "desanimo", label: "Desánimo", family: "tristeza" },
    { id: "miedo", label: "Miedo", family: "miedo" },
    { id: "preocupacion", label: "Preocupación", family: "miedo" },
    { id: "nervios", label: "Nervios", family: "miedo" },
    { id: "inseguridad", label: "Inseguridad", family: "miedo" },
    { id: "agobio", label: "Agobio", family: "miedo" },
    { id: "enfado", label: "Enfado", family: "enfado" },
    { id: "frustracion", label: "Frustración", family: "enfado" },
    { id: "irritacion", label: "Irritación", family: "enfado" },
    { id: "impotencia", label: "Impotencia", family: "enfado" },
    { id: "sorpresa", label: "Sorpresa", family: "sorpresa" },
    { id: "confusion", label: "Confusión", family: "sorpresa" },
    { id: "verguenza", label: "Vergüenza", family: "verguenza" },
    { id: "culpa", label: "Culpa", family: "verguenza" },
    { id: "celos", label: "Celos", family: "verguenza" },
  ],
};

export default pack;
