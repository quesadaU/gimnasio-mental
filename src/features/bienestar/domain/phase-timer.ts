/**
 * Temporizador por fases, puro y determinista: recibe el tiempo transcurrido y devuelve en qué
 * fase y paso se está. La UI solo mide el tiempo; aquí no hay relojes ni efectos.
 */

export interface TimedPhase {
  seconds: number;
}

export interface PhasePosition<P extends TimedPhase> {
  cycleIndex: number;
  phaseIndex: number;
  phase: P;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
}

/** Posición dentro de una secuencia cíclica de fases (p. ej. inhala/exhala) tras `elapsedMs`. */
export function phaseAt<P extends TimedPhase>(phases: readonly P[], elapsedMs: number): PhasePosition<P> {
  if (phases.length === 0) throw new Error("La secuencia de fases está vacía");
  const cycleMs = phases.reduce((total, phase) => total + phase.seconds * 1000, 0);
  if (!(cycleMs > 0)) throw new Error("La duración del ciclo debe ser positiva");

  const safeElapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  const cycleIndex = Math.floor(safeElapsed / cycleMs);
  let offset = safeElapsed - cycleIndex * cycleMs;

  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phaseMs = phases[phaseIndex].seconds * 1000;
    if (offset < phaseMs) {
      return { cycleIndex, phaseIndex, phase: phases[phaseIndex], phaseElapsedMs: offset, phaseRemainingMs: phaseMs - offset };
    }
    offset -= phaseMs;
  }
  // Solo por redondeo flotante: se devuelve el inicio del ciclo siguiente.
  return { cycleIndex: cycleIndex + 1, phaseIndex: 0, phase: phases[0], phaseElapsedMs: 0, phaseRemainingMs: phases[0].seconds * 1000 };
}

/** Número de ciclos completos que caben en una duración (para cerrar la sesión en un final de ciclo). */
export function wholeCycles(phases: readonly TimedPhase[], totalMs: number): number {
  const cycleMs = phases.reduce((total, phase) => total + phase.seconds * 1000, 0);
  if (!(cycleMs > 0) || !(totalMs > 0)) return 0;
  return Math.max(1, Math.round(totalMs / cycleMs));
}

export interface StepSlot {
  index: number;
  startMs: number;
  endMs: number;
}

/** Reparte `totalMs` entre pasos según su peso (por defecto 1). Los cortes se redondean al segundo. */
export function scheduleSteps(steps: readonly { weight?: number }[], totalMs: number): StepSlot[] {
  if (steps.length === 0 || !(totalMs > 0)) return [];
  const weights = steps.map((step) => (step.weight && step.weight > 0 ? step.weight : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const slots: StepSlot[] = [];
  let accumulated = 0;
  for (let index = 0; index < steps.length; index++) {
    const startMs = slots.length === 0 ? 0 : slots[slots.length - 1].endMs;
    accumulated += weights[index];
    const endMs = index === steps.length - 1 ? totalMs : Math.round((totalMs * accumulated) / totalWeight / 1000) * 1000;
    slots.push({ index, startMs, endMs: Math.max(startMs, endMs) });
  }
  return slots;
}

/** Índice del paso activo en `elapsedMs`, o `null` si el tiempo ya terminó. */
export function stepIndexAt(slots: readonly StepSlot[], elapsedMs: number): number | null {
  if (slots.length === 0) return null;
  const total = slots[slots.length - 1].endMs;
  if (elapsedMs >= total) return null;
  const safe = Math.max(0, elapsedMs);
  const found = slots.find((slot) => safe >= slot.startMs && safe < slot.endMs);
  return found ? found.index : 0;
}

/** Formatea milisegundos restantes como m:ss (redondeando hacia arriba para no mostrar 0:00 antes de tiempo). */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Descripción hablada de una duración, p. ej. "2 minutos y 5 segundos". */
export function describeDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minuto" : "minutos"}`);
  if (seconds > 0 || minutes === 0) parts.push(`${seconds} ${seconds === 1 ? "segundo" : "segundos"}`);
  return parts.join(" y ");
}
