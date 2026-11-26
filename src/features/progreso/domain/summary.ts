/**
 * Agregación pura del historial de sesiones. Sin React ni almacenamiento: recibe SessionResult[]
 * (los datos de todos los módulos llegan por ProgressStore, nunca importando otras features).
 */

import type { IsoDateTime, ModuleSlug, SessionResult } from "../../../core/types.ts";

/** Una sesión de más de 3 h se considera un reloj roto (pestaña olvidada) y se acota. */
export const MAX_SESSION_MINUTES = 180;

export interface ModuleSummary {
  module: ModuleSlug;
  sessions: number;
  minutes: number;
  lastEndedAt: IsoDateTime;
}

export interface ProgressSummary {
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  /** Ordenado de más a menos sesiones; empate por última sesión más reciente. */
  byModule: ModuleSummary[];
  /** Días naturales (UTC) distintos con al menos una sesión. Mide constancia, no tiempo en pantalla. */
  activeDays: number;
}

function timeOf(iso: string): number {
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : Number.NaN;
}

/** Duración en minutos (decimales), 0 si las fechas son inválidas o están invertidas. */
export function sessionMinutes(session: Pick<SessionResult, "startedAt" | "endedAt">): number {
  const start = timeOf(session.startedAt);
  const end = timeOf(session.endedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.min(MAX_SESSION_MINUTES, (end - start) / 60_000);
}

export function summarizeProgress(sessions: readonly SessionResult[]): ProgressSummary {
  const modules = new Map<ModuleSlug, ModuleSummary>();
  const days = new Set<string>();
  let totalMinutes = 0;
  let completedSessions = 0;

  for (const session of sessions) {
    const minutes = sessionMinutes(session);
    totalMinutes += minutes;
    if (session.outcome === "completada") completedSessions++;
    if (Number.isFinite(timeOf(session.endedAt))) days.add(session.endedAt.slice(0, 10));

    const current = modules.get(session.module);
    if (!current) {
      modules.set(session.module, {
        module: session.module,
        sessions: 1,
        minutes,
        lastEndedAt: session.endedAt,
      });
    } else {
      current.sessions++;
      current.minutes += minutes;
      if (compareIso(session.endedAt, current.lastEndedAt) > 0) current.lastEndedAt = session.endedAt;
    }
  }

  const byModule = [...modules.values()].sort(
    (a, b) => b.sessions - a.sessions || compareIso(b.lastEndedAt, a.lastEndedAt),
  );

  return {
    totalSessions: sessions.length,
    completedSessions,
    totalMinutes,
    byModule,
    activeDays: days.size,
  };
}

/** Sesiones más recientes primero (por endedAt). No muta la entrada. */
export function recentSessions(sessions: readonly SessionResult[], limit: number): SessionResult[] {
  return [...sessions].sort((a, b) => compareIso(b.endedAt, a.endedAt)).slice(0, Math.max(0, limit));
}

/** Compara fechas ISO; las inválidas quedan como las más antiguas. */
export function compareIso(a: string, b: string): number {
  const ta = timeOf(a);
  const tb = timeOf(b);
  const na = Number.isFinite(ta) ? ta : Number.NEGATIVE_INFINITY;
  const nb = Number.isFinite(tb) ? tb : Number.NEGATIVE_INFINITY;
  return na === nb ? 0 : na > nb ? 1 : -1;
}

/** Redondea minutos para mostrar: < 1 min cuenta como 0, el resto al entero más cercano. */
export function roundMinutes(minutes: number): number {
  return Math.round(Math.max(0, minutes));
}
