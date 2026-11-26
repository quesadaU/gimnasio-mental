import type { ContentLoader } from "@/core/types";
import type { Leccion, RutaSlug } from "@/features/habilidades/domain/types";

export { RUTAS } from "./catalogo";

/** Cargadores diferidos: cada paquete sale en su propio chunk y solo se carga al usarlo. */
export const CARGADORES_HABILIDADES: Readonly<Record<RutaSlug, ContentLoader<Leccion>>> = {
  programacion: () => import("./programacion/pack").then((m) => m.default),
  matematicas: () => import("./matematicas/pack").then((m) => m.default),
  filosofia: () => import("./filosofia/pack").then((m) => m.default),
  artes: () => import("./artes/pack").then((m) => m.default),
  "pensamiento-critico": () => import("./pensamiento-critico/pack").then((m) => m.default),
};
