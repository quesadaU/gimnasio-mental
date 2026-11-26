/**
 * Registro de módulos para la navegación. El orden del array es el orden de la navegación.
 * Añadir un módulo = añadir una entrada aquí + su carpeta en src/features y su ruta en src/app.
 */

import type { ModuleDefinition, ModuleSlug } from "./types";

export const MODULES: readonly ModuleDefinition[] = [
  {
    slug: "patio",
    title: "Patio de juegos",
    description:
      "Ajedrez táctico, sudoku y ejercicios de atención, memoria de trabajo y lógica con dificultad adaptativa.",
    href: "/patio",
    status: "activo",
  },
  {
    slug: "lectura",
    title: "Lectura",
    description:
      "Lectura profunda sin distracciones, con preguntas de comprensión y repaso espaciado de lo leído.",
    href: "/lectura",
    status: "activo",
  },
  {
    slug: "habilidades",
    title: "Habilidades",
    description:
      "Rutas de aprendizaje de programación, matemáticas, filosofía y artes basadas en práctica de recuperación.",
    href: "/habilidades",
    status: "activo",
  },
  {
    slug: "bienestar",
    title: "Bienestar mental",
    description:
      "Meditación guiada, respiración, manejo de emociones e higiene digital.",
    href: "/bienestar",
    status: "activo",
  },
  {
    slug: "progreso",
    title: "Progreso",
    description: "Tu historial de sesiones y su evolución, guardado solo en este dispositivo.",
    href: "/progreso",
    status: "activo",
  },
  {
    slug: "recompensas",
    title: "Recompensas y tienda",
    description: "Reconocimientos por constancia. Próximamente.",
    href: "/recompensas",
    status: "proximamente",
  },
  {
    slug: "rankings",
    title: "Rankings",
    description: "Comparativas opcionales con otros usuarios. Próximamente.",
    href: "/rankings",
    status: "proximamente",
  },
];

export function getModule(slug: ModuleSlug): ModuleDefinition {
  const found = MODULES.find((module) => module.slug === slug);
  if (!found) throw new Error(`Módulo no registrado: ${slug}`);
  return found;
}

export function findModuleBySlug(slug: string): ModuleDefinition | undefined {
  return MODULES.find((module) => module.slug === slug);
}

export function activeModules(): ModuleDefinition[] {
  return MODULES.filter((module) => module.status === "activo");
}
