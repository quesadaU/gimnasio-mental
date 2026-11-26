"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

export interface SessionSummaryItem {
  label: string;
  value: ReactNode;
}

interface SessionEndScreenProps {
  title: string;
  summary: readonly SessionSummaryItem[];
  onRepeat?: () => void;
  onExit: () => void;
  /** Sugerencia para la próxima vez (por ejemplo, alternar de dominio). */
  nextHint?: ReactNode;
}

/**
 * Pantalla estándar de fin de sesión (criterio 8.2: toda sesión tiene un final explícito).
 * Mueve el foco al título al montarse para que teclado y lectores de pantalla anuncien el cierre.
 * No encadena otra sesión automáticamente: repetir o salir es siempre una decisión de la persona.
 */
export function SessionEndScreen({ title, summary, onRepeat, onExit, nextHint }: SessionEndScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby={titleId}
      className="gm-rise flex flex-col gap-6 rounded-xl border border-line bg-surface p-6 shadow-card sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Sesión terminada</p>
        <h2
          id={titleId}
          ref={headingRef}
          tabIndex={-1}
          className="text-3xl font-semibold text-ink sm:text-4xl"
        >
          {title}
        </h2>
        <div aria-hidden="true" className="gm-ticks mt-1 w-32" />
      </div>

      {summary.length > 0 ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {summary.map((item) => (
            <div key={item.label} className="flex flex-col gap-1 rounded-lg bg-surface-2 p-4">
              <dt className="text-sm text-ink-muted">{item.label}</dt>
              <dd className="font-display text-2xl font-semibold tabular-nums text-ink">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {nextHint ? (
        <div className="rounded-lg border-l-4 border-accent bg-canvas px-4 py-3 text-ink">
          <p className="text-sm font-semibold text-ink-muted">Para la próxima vez</p>
          <div>{nextHint}</div>
        </div>
      ) : null}

      <p className="text-ink-muted">
        Aquí termina la sesión. Puedes repetirla o salir y descansar: no hay nada más en cola.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {onRepeat ? (
          <Button variant="secondary" size="lg" onClick={onRepeat}>
            Repetir sesión
          </Button>
        ) : null}
        <Button variant="primary" size="lg" onClick={onExit}>
          Salir
        </Button>
      </div>
    </section>
  );
}
