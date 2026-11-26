"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui";
import {
  elapsedMs,
  formatDuration,
  pauseTimer,
  resumeTimer,
  scrollProgress,
  startTimer,
  type ActiveTimer,
} from "../domain/reading-estimate";
import { FONT_SIZE_REM } from "../domain/prefs";
import type { ReadingText } from "../domain/types";
import { ReaderSettings } from "./reader-settings";
import { DIMMED_OPACITY, readerStyle, textStyle } from "./reader-theme";
import { SourceNote } from "./source-note";
import { useReaderPrefs } from "./use-reader-prefs";

/** Altura de la cabecera fija del sitio (h-16). La barra del lector se pega justo debajo. */
const SITE_HEADER_PX = 64;
/** Línea de lectura de referencia (fracción de la ventana) para el modo foco y la guía táctil. */
const READING_LINE = 0.4;

interface ReaderProps {
  text: ReadingText;
  /** Se llama al pulsar "He terminado de leer" con el tiempo activo (pestaña visible). */
  onFinished: (activeMs: number) => void;
}

/**
 * Lector sin distracciones: una columna de ~65 caracteres, sin popups, sin enlaces salientes,
 * sin nada que se reproduzca solo. Las ayudas (foco, guía, cronómetro) son opcionales y se recuerdan.
 */
export function Reader({ text, onFinished }: ReaderProps) {
  const [prefs, updatePrefs] = useReaderPrefs();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [guideTop, setGuideTop] = useState<number | null>(null);

  const articleRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLElement | null)[]>([]);
  const timerRef = useRef<ActiveTimer | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsId = useId();

  // Cronómetro de tiempo activo: se pausa si la pestaña se oculta.
  useEffect(() => {
    timerRef.current = startTimer(performance.now());
    const onVisibility = () => {
      const timer = timerRef.current;
      if (!timer) return;
      const now = performance.now();
      timerRef.current = document.hidden ? pauseTimer(timer, now) : resumeTimer(timer, now);
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // El cronómetro visible solo se actualiza si la persona lo ha activado.
  useEffect(() => {
    if (!prefs.showTimer) return;
    const tick = () => {
      const timer = timerRef.current;
      if (timer) setElapsed(elapsedMs(timer, performance.now()));
    };
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [prefs.showTimer]);

  // Progreso por scroll y párrafo activo (para el modo foco), medidos como mucho una vez por frame.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const article = articleRef.current;
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const viewport = window.innerHeight;
      setProgress(
        scrollProgress({
          articleTop: rect.top - SITE_HEADER_PX,
          articleHeight: rect.height,
          viewportHeight: viewport - SITE_HEADER_PX,
        }),
      );
      const line = viewport * READING_LINE;
      let index = 0;
      paragraphRefs.current.forEach((element, i) => {
        if (element && element.getBoundingClientRect().top <= line) index = i;
      });
      setActiveIndex(index);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [prefs.fontSize, prefs.font]);

  const lineHeightRem = FONT_SIZE_REM[prefs.fontSize] * 1.75;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!prefs.lineGuide || event.pointerType !== "mouse") return;
    setGuideTop(event.clientY);
  }

  function closeSettingsOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && settingsOpen) {
      setSettingsOpen(false);
      settingsButtonRef.current?.focus();
    }
  }

  function finish() {
    const timer = timerRef.current;
    onFinished(timer ? elapsedMs(timer, performance.now()) : 0);
  }

  const percent = Math.round(progress * 100);
  const isVerse = text.form === "verso";

  return (
    <div
      className="relative isolate -mx-4 px-4 pb-10 sm:mx-0 sm:rounded-xl sm:border sm:border-line sm:px-8"
      style={readerStyle(prefs)}
    >
      <div
        className="sticky z-20 -mx-4 px-4 sm:-mx-8 sm:px-8"
        style={{ top: SITE_HEADER_PX, backgroundColor: "var(--r-bg)" }}
        onKeyDown={closeSettingsOnEscape}
      >
        <div className="mx-auto flex max-w-[65ch] flex-wrap items-center justify-between gap-2 py-2 font-sans">
          <button
            ref={settingsButtonRef}
            type="button"
            aria-expanded={settingsOpen}
            aria-controls={settingsId}
            onClick={() => setSettingsOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-base font-semibold underline-offset-4 hover:underline"
          >
            <span aria-hidden="true">Aa</span>
            {settingsOpen ? "Cerrar ajustes" : "Ajustes de lectura"}
          </button>
          {prefs.showTimer ? (
            <span role="timer" aria-label="Tiempo de lectura" className="tabular-nums text-[var(--r-muted)]">
              {formatDuration(elapsed)}
            </span>
          ) : null}
        </div>
        {settingsOpen ? (
          <div className="mx-auto max-h-[60vh] max-w-[65ch] overflow-y-auto">
            <ReaderSettings id={settingsId} prefs={prefs} onChange={updatePrefs} />
          </div>
        ) : null}
        <div
          role="progressbar"
          aria-label="Progreso de lectura"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={`${percent} % del texto`}
          className="h-1 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: "color-mix(in oklab, var(--r-line) 35%, transparent)" }}
        >
          <div className="h-full" style={{ width: `${percent}%`, backgroundColor: "var(--r-accent)" }} />
        </div>
      </div>

      {prefs.lineGuide ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 z-0"
          style={{
            top: guideTop === null ? `calc(${READING_LINE * 100}vh - ${lineHeightRem / 2}rem)` : guideTop,
            height: `${lineHeightRem}rem`,
            transform: guideTop === null ? undefined : "translateY(-50%)",
            backgroundColor: "var(--r-guide)",
            borderBlock: "1px solid color-mix(in oklab, var(--r-accent) 30%, transparent)",
          }}
        />
      ) : null}

      <div
        ref={articleRef}
        onPointerMove={handlePointerMove}
        className="relative z-10 mx-auto max-w-[65ch] pt-8"
        style={textStyle(prefs)}
      >
        {text.paragraphs.map((paragraph, index) => (
          <p
            key={index}
            ref={(element) => {
              paragraphRefs.current[index] = element;
            }}
            className={
              "mb-[1.1em] transition-opacity duration-300 " +
              (isVerse ? "whitespace-pre-line" : "hyphens-auto")
            }
            lang="es"
            style={{ opacity: prefs.focusMode && index !== activeIndex ? DIMMED_OPACITY : 1 }}
          >
            {paragraph}
          </p>
        ))}

        <SourceNote text={text} />

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--r-line)] pt-6 font-sans text-base">
          <p className="text-[var(--r-muted)]">
            Cuando termines, pasarás a explicar el texto con tus palabras y a responder unas preguntas
            de memoria. No hay prisa: el tiempo solo se usa para darte un dato orientativo.
          </p>
          <div>
            <Button size="lg" onClick={finish}>
              He terminado de leer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
