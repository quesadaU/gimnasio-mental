/**
 * Estimación de tiempo de lectura y medición orientativa del ritmo.
 *
 * Referencia: en adultos, la lectura silenciosa de prosa no técnica suele rondar las 200-260 palabras
 * por minuto, con mucha variación entre personas y textos (Brysbaert, 2019, metaanálisis). Usamos 220
 * como valor por defecto solo para estimar la duración; el ritmo medido se muestra como dato, nunca
 * como puntuación, porque leer más rápido no equivale a comprender mejor.
 */

export const DEFAULT_WORDS_PER_MINUTE = 220;

/** Por debajo de este tiempo activo la medición no es fiable (probablemente no se ha leído). */
export const MIN_MEASURABLE_MS = 20_000;
/** Ritmos fuera de este rango indican una medición no representativa (hojear, pausas largas...). */
export const PLAUSIBLE_WPM = { min: 50, max: 700 } as const;

export function countWords(paragraphs: readonly string[]): number {
  let total = 0;
  for (const paragraph of paragraphs) {
    const tokens = paragraph.match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu);
    total += tokens ? tokens.length : 0;
  }
  return total;
}

/** Minutos estimados, redondeados hacia arriba y con un mínimo de 1. */
export function estimateMinutes(words: number, wordsPerMinute = DEFAULT_WORDS_PER_MINUTE): number {
  if (!Number.isFinite(words) || words <= 0) return 1;
  const wpm = wordsPerMinute > 0 ? wordsPerMinute : DEFAULT_WORDS_PER_MINUTE;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * Ritmo medido en palabras por minuto, o `undefined` si la medición no es representativa.
 * `activeMs` debe contar solo el tiempo con la pestaña visible.
 */
export function measureWordsPerMinute(words: number, activeMs: number): number | undefined {
  if (!Number.isFinite(activeMs) || activeMs < MIN_MEASURABLE_MS || words <= 0) return undefined;
  const wpm = Math.round(words / (activeMs / 60_000));
  if (wpm < PLAUSIBLE_WPM.min || wpm > PLAUSIBLE_WPM.max) return undefined;
  return wpm;
}

/**
 * Cronómetro de tiempo activo puro: se pausa cuando la pestaña se oculta y se reanuda al volver,
 * para no contar como lectura el tiempo en otra aplicación.
 */
export interface ActiveTimer {
  accumulatedMs: number;
  /** Marca (ms) del último arranque; `null` si está en pausa. */
  runningSince: number | null;
}

export function startTimer(nowMs: number): ActiveTimer {
  return { accumulatedMs: 0, runningSince: nowMs };
}

export function pauseTimer(timer: ActiveTimer, nowMs: number): ActiveTimer {
  if (timer.runningSince === null) return timer;
  return {
    accumulatedMs: timer.accumulatedMs + Math.max(0, nowMs - timer.runningSince),
    runningSince: null,
  };
}

export function resumeTimer(timer: ActiveTimer, nowMs: number): ActiveTimer {
  if (timer.runningSince !== null) return timer;
  return { ...timer, runningSince: nowMs };
}

export function elapsedMs(timer: ActiveTimer, nowMs: number): number {
  const running = timer.runningSince === null ? 0 : Math.max(0, nowMs - timer.runningSince);
  return timer.accumulatedMs + running;
}

/** "m:ss" para mostrar un tiempo de forma discreta. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Progreso de lectura (0-1) a partir de la posición de scroll dentro del artículo. */
export function scrollProgress(input: {
  articleTop: number;
  articleHeight: number;
  viewportHeight: number;
}): number {
  const { articleTop, articleHeight, viewportHeight } = input;
  const scrollable = articleHeight - viewportHeight;
  if (scrollable <= 0) return articleTop <= viewportHeight ? 1 : 0;
  const ratio = -articleTop / scrollable;
  return Math.min(1, Math.max(0, ratio));
}
