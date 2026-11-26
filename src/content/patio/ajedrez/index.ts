import type { ContentLoader, ContentPack } from "@/core/types";
import type { ChessPuzzle } from "@/features/patio/games/ajedrez/domain/puzzles";

/**
 * Paquetes de puzzles de ajedrez. Cada uno se carga con import() y sale como chunk aparte.
 * Todas las soluciones están verificadas por `domain/puzzles-pack.test.ts` con el validador propio.
 */
export const AJEDREZ_PACKS = {
  "tacticas-basicas": () =>
    import("./tacticas-basicas.json").then((module) => module.default as ContentPack<ChessPuzzle>),
} satisfies Record<string, ContentLoader<ChessPuzzle>>;
