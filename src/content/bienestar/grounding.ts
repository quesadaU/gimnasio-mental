import type { ContentPack } from "@/core/types";
import type { GroundingStep } from "@/features/bienestar/domain/types";

/** Pausa 5-4-3-2-1. Si algún sentido no te sirve, se puede cambiar por otro o saltar. */
const pack: ContentPack<GroundingStep> = {
  id: "pausa-5-4-3-2-1",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Pausa 5-4-3-2-1",
  items: [
    {
      id: "ver",
      count: 5,
      sense: "cosas que puedes ver",
      prompt: "Mira a tu alrededor y nombra por dentro cinco cosas que ves. Pueden ser pequeñas: una sombra, un color, una esquina.",
    },
    {
      id: "tocar",
      count: 4,
      sense: "cosas que puedes sentir con el cuerpo",
      prompt: "Nota cuatro sensaciones: la ropa sobre la piel, los pies en el suelo, la temperatura de las manos, el apoyo de la espalda.",
    },
    {
      id: "oir",
      count: 3,
      sense: "sonidos que puedes oír",
      prompt: "Escucha tres sonidos, cercanos o lejanos. También vale el silencio o tu propia respiración.",
    },
    {
      id: "oler",
      count: 2,
      sense: "olores que puedes notar",
      prompt: "Busca dos olores. Si no notas ninguno, puedes recordar dos olores que te gusten.",
    },
    {
      id: "saborear",
      count: 1,
      sense: "sabor que puedes notar",
      prompt: "Nota un sabor en la boca, o da un sorbo de agua si tienes a mano.",
    },
  ],
};

export default pack;
