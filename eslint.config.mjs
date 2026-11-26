import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * Límites entre módulos (docs/ARQUITECTURA.md, sección 7).
 * - src/core: TypeScript puro; no importa React, Next ni nada fuera de core.
 * - Cada feature no importa de otra feature (si algo se comparte: dominio -> core, UI -> components/ui).
 */
const FEATURES = ["patio", "lectura", "habilidades", "bienestar", "progreso"];

const coreBoundaries = {
  files: ["src/core/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "react",
              "react-*",
              "react/*",
              "next",
              "next/*",
              "@/features/*",
              "@/components/*",
              "@/app/*",
              "../features/**",
              "../components/**",
              "../app/**",
            ],
            message: "src/core es TypeScript puro: sin React/Next ni imports de features, components o app.",
          },
        ],
      },
    ],
  },
};

const featureBoundaries = FEATURES.map((feature) => ({
  files: [`src/features/${feature}/**`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [
              "@/features/*",
              `!@/features/${feature}`,
              `!@/features/${feature}/**`,
              ...FEATURES.filter((other) => other !== feature).flatMap((other) => [
                `**/features/${other}`,
                `**/features/${other}/**`,
              ]),
            ],
            message: `La feature "${feature}" no puede importar de otras features. Comparte dominio vía src/core o UI vía src/components/ui.`,
          },
        ],
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  coreBoundaries,
  ...featureBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
