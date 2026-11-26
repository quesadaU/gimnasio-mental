"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ContentLoader, ContentPack } from "@/core/types";

// --- Movimiento reducido -------------------------------------------------------------------

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** `true` si el sistema pide reducir el movimiento. En servidor se asume `true` (versión textual). */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );
}

// --- Cronómetro ----------------------------------------------------------------------------

export interface Stopwatch {
  elapsedMs: number;
  running: boolean;
  start(): void;
  pause(): void;
  reset(): void;
}

/** Cronómetro basado en `performance.now()`: no deriva aunque el navegador ralentice los timers. */
export function useStopwatch(tickMs = 200): Stopwatch {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt !== null) setElapsedMs(accumulatedRef.current + performance.now() - startedAt);
    }, tickMs);
    return () => window.clearInterval(id);
  }, [running, tickMs]);

  const start = useCallback(() => {
    if (startedAtRef.current !== null) return;
    startedAtRef.current = performance.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    const startedAt = startedAtRef.current;
    if (startedAt === null) return;
    accumulatedRef.current += performance.now() - startedAt;
    startedAtRef.current = null;
    setElapsedMs(accumulatedRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    setElapsedMs(0);
    setRunning(false);
  }, []);

  return { elapsedMs, running, start, pause, reset };
}

// --- Carga de contenido --------------------------------------------------------------------

export type PackState<T> =
  | { status: "cargando" }
  | { status: "error" }
  | { status: "listo"; pack: ContentPack<T> };

export function useContentPack<T>(loader: ContentLoader<T> | undefined): { state: PackState<T>; retry(): void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; state: PackState<T> } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = loader ? loader() : Promise.reject(new Error("Paquete no registrado"));
    run.then(
      (pack) => {
        if (!cancelled) setResult({ attempt, state: { status: "listo", pack } });
      },
      () => {
        if (!cancelled) setResult({ attempt, state: { status: "error" } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [loader, attempt]);

  const state: PackState<T> = result && result.attempt === attempt ? result.state : { status: "cargando" };
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { state, retry };
}

// --- Voz del navegador (opcional) ----------------------------------------------------------

function noopSubscribe(): () => void {
  return () => {};
}

export function useSpeechSupported(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function",
    () => false,
  );
}

/** Lee `text` en voz alta cuando cambia, solo si `enabled`. Cancela al cambiar, pausar o desmontar. */
export function useSpeakOnChange(text: string | null, enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      /* La voz es un extra: si falla, la práctica sigue en texto. */
    }
    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* sin voz disponible */
      }
    };
  }, [text, enabled]);
}
