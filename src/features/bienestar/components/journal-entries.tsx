"use client";

import { useState } from "react";
import { Button, EmptyState } from "@/components/ui";
import { buildExport, exportFileName, removeEntry, type JournalData } from "../domain/journal";
import type { ReappraisalPrompt } from "../domain/types";
import { downloadTextFile } from "./journal-storage";
import { Notice } from "./practice-ui";

interface JournalEntriesProps {
  data: JournalData;
  readOnly: boolean;
  emotionLabel: ReadonlyMap<string, string>;
  prompts: readonly ReappraisalPrompt[];
  /** Persiste el nuevo estado; devuelve `false` si no se pudo guardar. */
  onChange(data: JournalData): boolean;
}

const dateFormat = new Intl.DateTimeFormat("es-ES", { dateStyle: "long", timeStyle: "short" });

export function JournalEntries({ data, readOnly, emotionLabel, prompts, onChange }: JournalEntriesProps) {
  const [confirming, setConfirming] = useState<string | "todo" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function apply(next: JournalData, success: string) {
    setMessage(onChange(next) ? success : "No se ha podido borrar. Inténtalo de nuevo.");
    setConfirming(null);
  }

  function exportAll() {
    const ok = downloadTextFile(exportFileName(new Date()), buildExport(data, new Date()));
    setMessage(ok ? "Archivo descargado. Guárdalo en un lugar seguro: no está cifrado." : "No se ha podido exportar.");
  }

  return (
    <section aria-labelledby="tus-entradas" className="space-y-4">
      <h2 id="tus-entradas" className="text-xl font-semibold sm:text-2xl">
        Tus entradas{data.entries.length > 0 && ` (${data.entries.length})`}
      </h2>

      <p role="status" className="min-h-6 text-sm">
        {message}
      </p>

      {data.entries.length === 0 ? (
        <EmptyState
          title="Todavía no hay entradas"
          description="Cuando guardes una, aparecerá aquí. Solo tú puedes verla, en este dispositivo."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportAll}>
              Exportar todo (JSON)
            </Button>
            {!readOnly &&
              (confirming === "todo" ? (
                <>
                  <span className="w-full">¿Borrar todas las entradas de este dispositivo? No se puede deshacer.</span>
                  <Button variant="secondary" onClick={() => apply({ entries: [] }, "Se han borrado todas las entradas.")}>
                    Sí, borrar todo
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirming(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setConfirming("todo")}>
                  Borrar todo
                </Button>
              ))}
          </div>
          <Notice>El archivo exportado no está cifrado. Si lo compartes, decide tú con quién.</Notice>
          <ul className="space-y-3">
            {data.entries.map((entry) => {
              const date = new Date(entry.createdAt);
              const prompt = entry.reappraisal && prompts.find((p) => p.id === entry.reappraisal?.promptId);
              return (
                <li key={entry.id} className="rounded-xl border border-line">
                  <details className="group">
                    <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-xl p-4">
                      <span className="font-medium">
                        {entry.emotions.map((id) => emotionLabel.get(id) ?? id).join(", ")}
                        <span className="text-ink-muted"> · {entry.intensity}/10</span>
                      </span>
                      <time dateTime={entry.createdAt} className="text-sm text-ink-muted">
                        {Number.isNaN(date.getTime()) ? entry.createdAt : dateFormat.format(date)}
                      </time>
                    </summary>
                    <div className="space-y-3 border-t border-line p-4">
                      {entry.situation && <Field term="Situación" value={entry.situation} />}
                      {entry.thought && <Field term="Pensamiento" value={entry.thought} />}
                      {entry.reappraisal && (
                        <Field term={prompt ? prompt.question : "Otro ángulo"} value={entry.reappraisal.answer} />
                      )}
                      {entry.intensityAfter !== undefined && (
                        <Field term="Intensidad después" value={`${entry.intensityAfter}/10`} />
                      )}
                      {!readOnly &&
                        (confirming === entry.id ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <span>¿Borrar esta entrada?</span>
                            <Button variant="secondary" onClick={() => apply(removeEntry(data, entry.id), "Entrada borrada.")}>
                              Sí, borrar
                            </Button>
                            <Button variant="ghost" onClick={() => setConfirming(null)}>
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" onClick={() => setConfirming(entry.id)}>
                            Borrar esta entrada
                          </Button>
                        ))}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

function Field({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-muted">{term}</p>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  );
}
