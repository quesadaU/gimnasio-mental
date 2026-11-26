"use client";

import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from "react";
import type { ExerciseDefinition, SessionResult } from "@/core/types";
import { buildPracticeSession } from "../domain/session";

/** Marca el inicio de la práctica y construye el SessionResult al terminar o detenerse. */
export function usePracticeSession(
  definition: ExerciseDefinition,
  onFinish: (result: SessionResult) => void,
): { begin(): void; hasBegun(): boolean; finish(completed: boolean, contentId?: string): void } {
  const startedAtRef = useRef<Date | null>(null);
  const finishedRef = useRef(false);

  const begin = useCallback(() => {
    if (!startedAtRef.current) startedAtRef.current = new Date();
  }, []);

  const hasBegun = useCallback(() => startedAtRef.current !== null, []);

  const finish = useCallback(
    (completed: boolean, contentId?: string) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const endedAt = new Date();
      onFinish(
        buildPracticeSession({
          id: crypto.randomUUID(),
          exerciseId: definition.id,
          contentId,
          startedAt: startedAtRef.current ?? endedAt,
          endedAt,
          completed,
        }),
      );
    },
    [definition.id, onFinish],
  );

  return { begin, hasBegun, finish };
}

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface ChoiceGroupProps<T extends string> {
  legend: string;
  name: string;
  options: readonly Choice<T>[];
  value: T | undefined;
  onChange(value: T): void;
  layout?: "fila" | "columna";
}

/** Grupo de radios nativos con aspecto de opciones táctiles (≥ 44 px) y foco visible. */
export function ChoiceGroup<T extends string>({ legend, name, options, value, onChange, layout = "fila" }: ChoiceGroupProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className={layout === "fila" ? "flex flex-wrap gap-2" : "grid gap-2"}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-line-strong px-4 py-2.5 has-checked:border-primary has-checked:bg-surface-2"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 size-4 accent-primary"
            />
            <span>
              <span className="font-medium">{option.label}</span>
              {option.description && <span className="block text-sm text-ink-muted">{option.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Barra inferior fija con las acciones principales (p. ej. Detener), siempre visible. */
export function StickyActions({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-line bg-canvas/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:mx-0 sm:rounded-2xl sm:border"
    >
      {children}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "aviso"; children: ReactNode }) {
  const toneClass =
    tone === "aviso"
      ? "border-warning/50 bg-warning-soft text-ink"
      : "border-info/40 bg-info-soft text-ink";
  return <div className={`rounded-xl border p-4 leading-relaxed ${toneClass}`}>{children}</div>;
}

/** Al empezar una práctica, lleva su zona activa a la vista (en móvil la cabecera la empuja abajo). */
export function useScrollIntoViewOnMount(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "start" });
  }, [ref]);
}
