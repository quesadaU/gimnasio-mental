/**
 * Preferencias del lector. Se guardan con `readVersioned`/`writeVersioned` en la clave
 * `gm:lectura:prefs` (el prefijo `gm:` lo añade el núcleo).
 */

export const READER_PREFS_KEY = "lectura:prefs";
export const READER_PREFS_VERSION = 1;

/** "auto" sigue el tema de la app (claro u oscuro según el sistema). */
export type ReaderTheme = "auto" | "claro" | "sepia" | "oscuro";
export type ReaderFont = "serif" | "sans";
export type ReaderFontSize = "s" | "m" | "l" | "xl";

export interface ReaderPrefs {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: ReaderFontSize;
  /** Atenúa los párrafos que no se están leyendo. */
  focusMode: boolean;
  /** Banda horizontal que marca la línea de lectura. */
  lineGuide: boolean;
  /** Muestra un cronómetro discreto (nunca cuenta atrás). */
  showTimer: boolean;
}

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  theme: "auto",
  font: "serif",
  fontSize: "m",
  focusMode: false,
  lineGuide: false,
  showTimer: false,
};

export const THEMES: readonly ReaderTheme[] = ["auto", "claro", "sepia", "oscuro"];
export const FONTS: readonly ReaderFont[] = ["serif", "sans"];
export const FONT_SIZES: readonly ReaderFontSize[] = ["s", "m", "l", "xl"];

/** Tamaños en rem; el usuario además puede ampliar con el navegador (no se bloquea el zoom). */
export const FONT_SIZE_REM: Readonly<Record<ReaderFontSize, number>> = {
  s: 1,
  m: 1.125,
  l: 1.3125,
  xl: 1.5,
};

export function isReaderPrefs(value: unknown): value is ReaderPrefs {
  if (typeof value !== "object" || value === null) return false;
  const prefs = value as Record<string, unknown>;
  return (
    THEMES.includes(prefs.theme as ReaderTheme) &&
    FONTS.includes(prefs.font as ReaderFont) &&
    FONT_SIZES.includes(prefs.fontSize as ReaderFontSize) &&
    typeof prefs.focusMode === "boolean" &&
    typeof prefs.lineGuide === "boolean" &&
    typeof prefs.showTimer === "boolean"
  );
}

export const readerPrefsSchema = {
  version: READER_PREFS_VERSION,
  migrations: {},
  validate: isReaderPrefs,
};

export function stepFontSize(current: ReaderFontSize, delta: 1 | -1): ReaderFontSize {
  const index = FONT_SIZES.indexOf(current);
  const next = Math.min(FONT_SIZES.length - 1, Math.max(0, index + delta));
  return FONT_SIZES[next];
}
