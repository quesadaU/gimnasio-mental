import type { CSSProperties } from "react";
import { FONT_SIZE_REM, type ReaderFont, type ReaderPrefs, type ReaderTheme } from "../domain/prefs";

/*
 * Paletas del lector. Contraste comprobado con la fórmula WCAG 2.2:
 *   claro  #1d1d1b / #fdfcf8 ≈ 16:1, texto secundario #55524b ≈ 7.5:1
 *   sepia  #3a2e22 / #f4ecd8 ≈ 11:1, texto secundario #5e4d3b ≈ 6.9:1
 *   oscuro #e6e3dc / #141615 ≈ 14:1, texto secundario #a9aea9 ≈ 8:1
 * Los párrafos atenuados del modo foco usan opacidad 0.72, que mantiene ≥ 4.5:1 en los tres temas.
 * "auto" usa los tokens de la app, que ya cumplen AA en claro y oscuro.
 */
type ThemeVars = Record<"--r-bg" | "--r-ink" | "--r-muted" | "--r-line" | "--r-accent" | "--r-guide", string>;

const THEME_VARS: Readonly<Record<ReaderTheme, ThemeVars>> = {
  auto: {
    "--r-bg": "var(--gm-surface)",
    "--r-ink": "var(--gm-ink)",
    "--r-muted": "var(--gm-ink-muted)",
    "--r-line": "var(--gm-line-strong)",
    "--r-accent": "var(--gm-primary)",
    "--r-guide": "color-mix(in oklab, var(--gm-primary) 12%, transparent)",
  },
  claro: {
    "--r-bg": "#fdfcf8",
    "--r-ink": "#1d1d1b",
    "--r-muted": "#55524b",
    "--r-line": "#8a877f",
    "--r-accent": "#2c5a4c",
    "--r-guide": "rgb(44 90 76 / 0.1)",
  },
  sepia: {
    "--r-bg": "#f4ecd8",
    "--r-ink": "#3a2e22",
    "--r-muted": "#5e4d3b",
    "--r-line": "#8c7a62",
    "--r-accent": "#7a3e12",
    "--r-guide": "rgb(122 62 18 / 0.1)",
  },
  oscuro: {
    "--r-bg": "#141615",
    "--r-ink": "#e6e3dc",
    "--r-muted": "#a9aea9",
    "--r-line": "#6f7570",
    "--r-accent": "#8fcbb5",
    "--r-guide": "rgb(143 203 181 / 0.13)",
  },
};

const FONT_STACKS: Readonly<Record<ReaderFont, string>> = {
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif',
  sans: "var(--font-atkinson), ui-sans-serif, system-ui, sans-serif",
};

export const THEME_LABELS: Readonly<Record<ReaderTheme, string>> = {
  auto: "Como la app",
  claro: "Claro",
  sepia: "Sepia",
  oscuro: "Oscuro",
};

export const FONT_LABELS: Readonly<Record<ReaderFont, string>> = {
  serif: "Serif clásica",
  sans: "Sans de alta legibilidad",
};

export const DIMMED_OPACITY = 0.72;

export function readerStyle(prefs: ReaderPrefs): CSSProperties {
  return {
    ...THEME_VARS[prefs.theme],
    backgroundColor: "var(--r-bg)",
    color: "var(--r-ink)",
    colorScheme: prefs.theme === "oscuro" ? "dark" : prefs.theme === "auto" ? undefined : "light",
  } as CSSProperties;
}

export function textStyle(prefs: ReaderPrefs): CSSProperties {
  return {
    fontFamily: FONT_STACKS[prefs.font],
    fontSize: `${FONT_SIZE_REM[prefs.fontSize]}rem`,
    lineHeight: 1.75,
  };
}
