import { findModuleBySlug } from "@/core/modules-registry";

const dateTimeFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" });
const relativeFormat = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Fecha desconocida" : dateTimeFormat.format(date);
}

/** "hoy", "ayer", "hace 3 días"... (precisión de días, sin urgencia). */
export function formatDaysAgo(iso: string, now: Date): string {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "hace un tiempo";
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const date = new Date(time);
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfThatDay - startOfToday) / 86_400_000);
  return relativeFormat.format(days, "day");
}

export function moduleTitle(slug: string): string {
  return findModuleBySlug(slug)?.title ?? slug;
}

/** "busqueda-visual" -> "Busqueda visual". Progreso no importa los registros de otras features. */
export function humanizeId(id: string): string {
  const text = id.replace(/[-_:]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : id;
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
