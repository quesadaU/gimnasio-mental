"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { LECTURA_CATALOG } from "@/content/lectura";
import { useProgressStore } from "@/components/progress-store-provider";
import { Badge, ButtonLink, Card, CardBody, EmptyState } from "@/components/ui";
import {
  DURATION_LABELS,
  durationBucket,
  filterCatalog,
  readTextIds,
  type DurationBucket,
  type LibraryFilters,
  type ReadStatusFilter,
} from "../domain/library";
import { LECTURA_DECK_ID, selectTodayReview } from "../domain/review";
import { LEVEL_LABELS, TOPIC_LABELS, type ReadingLevel, type ReadingTopic } from "../domain/types";

const STATUS_LABELS: Record<ReadStatusFilter, string> = {
  todos: "Todos",
  pendientes: "Pendientes",
  leidos: "Leídos",
};

/** Biblioteca de textos con filtros. El estado leído/pendiente sale de las sesiones guardadas. */
export function Library() {
  const store = useProgressStore();
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const [dueCount, setDueCount] = useState(0);
  const [storeError, setStoreError] = useState(false);
  const [filters, setFilters] = useState<LibraryFilters>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([store.listSessions({ module: "lectura" }), store.listReviewCards(LECTURA_DECK_ID)]).then(
      ([sessions, cards]) => {
        if (cancelled) return;
        setReadIds(readTextIds(sessions));
        setDueCount(selectTodayReview(cards, new Date()).length);
      },
      () => {
        if (!cancelled) setStoreError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [store]);

  const visible = useMemo(() => filterCatalog(LECTURA_CATALOG, filters, readIds), [filters, readIds]);
  const hasFilters = Object.values(filters).some((value) => value && value !== "todos");

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Repaso del día</h2>
              <p className="text-ink-muted">
                {dueCount > 0
                  ? `Tienes ${dueCount} ${dueCount === 1 ? "idea" : "ideas"} para recordar hoy.`
                  : "No hay ideas pendientes de repaso ahora mismo."}
              </p>
            </div>
            {dueCount > 0 ? <ButtonLink href="/lectura/repaso">Empezar repaso</ButtonLink> : null}
          </div>
        </CardBody>
      </Card>

      {storeError ? (
        <p role="status" className="rounded-md bg-warning-soft px-4 py-3 text-warning">
          No se pudo leer tu historial: no se mostrará qué textos has leído.
        </p>
      ) : null}

      <form
        aria-label="Filtros de la biblioteca"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <FilterSelect
          label="Tema"
          value={filters.topic}
          options={TOPIC_LABELS}
          onChange={(topic) => setFilters((f) => ({ ...f, topic: topic as ReadingTopic | undefined }))}
        />
        <FilterSelect
          label="Nivel"
          value={filters.level}
          options={LEVEL_LABELS}
          onChange={(level) => setFilters((f) => ({ ...f, level: level as ReadingLevel | undefined }))}
        />
        <FilterSelect
          label="Duración"
          value={filters.duration}
          options={DURATION_LABELS}
          onChange={(duration) => setFilters((f) => ({ ...f, duration: duration as DurationBucket | undefined }))}
        />
        <FilterSelect
          label="Estado"
          value={filters.status === "todos" ? undefined : filters.status}
          options={{ pendientes: STATUS_LABELS.pendientes, leidos: STATUS_LABELS.leidos }}
          onChange={(status) => setFilters((f) => ({ ...f, status: status as ReadStatusFilter | undefined }))}
        />
      </form>

      <p role="status" aria-live="polite" className="text-sm text-ink-muted">
        {visible.length} {visible.length === 1 ? "texto" : "textos"}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title="Ningún texto coincide"
          description="Prueba con otros filtros."
          action={
            hasFilters ? (
              <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => setFilters({})}>
                Quitar filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((text) => (
            <li key={text.id}>
              <Card className="h-full">
                <CardBody>
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="info">{TOPIC_LABELS[text.topic]}</Badge>
                      <Badge>{LEVEL_LABELS[text.level]}</Badge>
                      {readIds.has(text.id) ? <Badge tone="success">Leído</Badge> : null}
                    </div>
                    <h3 className="text-xl font-semibold text-ink">
                      <Link
                        href={`/lectura/${text.id}`}
                        className="underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2"
                      >
                        {text.title}
                      </Link>
                    </h3>
                    <p className="text-ink-muted">{text.summary}</p>
                    <p className="mt-auto text-sm text-ink-muted">
                      {text.author} · {text.words} palabras · {DURATION_LABELS[durationBucket(text.words)].split(" (")[0]}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: Readonly<Record<string, string>>;
  onChange: (value: string | undefined) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
        className="min-h-11 rounded-md border border-line-strong bg-canvas px-3 text-base text-ink"
      >
        <option value="">Todos</option>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
