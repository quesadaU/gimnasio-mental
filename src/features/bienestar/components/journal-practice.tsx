"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ExerciseProps } from "@/components/exercise/contract";
import { Button, ErrorState, LoadingState } from "@/components/ui";
import { emotionLoaders, reappraisalLoaders } from "@/content/bienestar";
import { suggestsCrisis } from "../domain/crisis";
import {
  addEntry,
  buildExport,
  createEntry,
  emptyJournal,
  exportFileName,
  INTENSITY_MAX,
  INTENSITY_MIN,
  MAX_EMOTIONS_PER_ENTRY,
  MAX_TEXT_LENGTH,
  type JournalDraft,
} from "../domain/journal";
import { EMOTION_FAMILIES, type EmotionItem, type ReappraisalPrompt } from "../domain/types";
import { CrisisResources } from "./crisis-resources";
import { useContentPack } from "./hooks";
import { JournalEntries } from "./journal-entries";
import { deleteJournal, downloadTextFile, loadJournal, saveJournal, type LoadedJournal } from "./journal-storage";
import { ChoiceGroup, Notice, StickyActions, usePracticeSession } from "./practice-ui";

const STEPS = ["Qué sientes", "Qué ha pasado", "Otro ángulo (opcional)", "Revisar y guardar"] as const;

export default function JournalPractice(props: ExerciseProps) {
  const emotions = useContentPack(emotionLoaders["emociones-basicas"]);
  const prompts = useContentPack(reappraisalLoaders["reevaluacion-guiada"]);

  if (emotions.state.status === "cargando" || prompts.state.status === "cargando") {
    return <LoadingState label="Preparando el registro…" />;
  }
  if (emotions.state.status === "error" || prompts.state.status === "error") {
    return (
      <ErrorState
        title="No hemos podido cargar el registro"
        description="Inténtalo de nuevo."
        onRetry={() => {
          emotions.retry();
          prompts.retry();
        }}
      />
    );
  }
  return <JournalRun {...props} emotions={emotions.state.pack.items} prompts={prompts.state.pack.items} />;
}

interface JournalRunProps extends ExerciseProps {
  emotions: readonly EmotionItem[];
  prompts: readonly ReappraisalPrompt[];
}

const EMPTY_DRAFT: JournalDraft = { emotions: [], intensity: 5, situation: "", thought: "" };

function JournalRun({ definition, onFinish, onExit, emotions, prompts }: JournalRunProps) {
  // Este componente solo se monta en cliente (carga diferida), así que leer aquí es seguro.
  const [journal, setJournal] = useState<LoadedJournal>(() => loadJournal());
  const [draft, setDraft] = useState<JournalDraft>(EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [showAfter, setShowAfter] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const { begin, finish } = usePracticeSession(definition, onFinish);

  const touched = draft !== EMPTY_DRAFT;
  const readOnly = journal.status === "version-futura";
  const unreadable = journal.status === "invalido";
  const canSave = !readOnly && !unreadable;
  const showCrisis = suggestsCrisis(draft.situation, draft.thought, draft.reappraisalAnswer);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function update(changes: Partial<JournalDraft>) {
    begin();
    setDraft((current) => ({ ...current, ...changes }));
  }

  function next() {
    if (step === 0 && draft.emotions.length === 0) {
      setStepError("Elige al menos una emoción para continuar. Si no encuentras la palabra, elige la más cercana.");
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function save() {
    const entry = createEntry(
      { ...draft, intensityAfter: showAfter ? draft.intensityAfter ?? draft.intensity : undefined },
      crypto.randomUUID(),
      new Date(),
    );
    const nextData = addEntry(journal.data, entry);
    if (!saveJournal(nextData)) {
      setSaveFailed(true);
      return;
    }
    setJournal({ status: "ok", data: nextData });
    finish(true);
  }

  function exportDraft() {
    const entry = createEntry(draft, crypto.randomUUID(), new Date());
    downloadTextFile(exportFileName(new Date()), buildExport({ entries: [entry] }, new Date()));
  }

  function leave() {
    if (touched) finish(false);
    else onExit();
  }

  function resetUnreadable() {
    if (deleteJournal()) setJournal({ status: "vacio", data: emptyJournal() });
    setConfirmReset(false);
  }

  const emotionLabel = new Map(emotions.map((emotion) => [emotion.id, emotion.label]));

  return (
    <div className="space-y-8">
      <Notice>
        <strong>Tu privacidad:</strong> lo que escribas se guarda solo en este navegador, en este dispositivo. No se
        envía a ningún servidor ni a nadie. Cualquier persona que use este dispositivo podría verlo. Puedes exportarlo o
        borrarlo cuando quieras.
      </Notice>

      {journal.status === "no-disponible" && (
        <Notice tone="aviso">
          Este navegador no permite guardar datos (quizá estás en modo privado). Puedes escribir igualmente, pero la
          entrada no se conservará. Si quieres quedártela, usa «Exportar esta entrada» antes de salir.
        </Notice>
      )}
      {readOnly && (
        <Notice tone="aviso">
          Tus entradas se guardaron con una versión más nueva de la app. Puedes verlas, pero para no estropearlas no
          guardaremos entradas nuevas desde esta versión.
        </Notice>
      )}
      {unreadable && (
        <Notice tone="aviso">
          <p>Hay entradas guardadas que no podemos leer. No las hemos tocado ni sobrescrito.</p>
          {confirmReset ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="w-full">¿Borrar esos datos y empezar de cero? No se puede deshacer.</span>
              <Button variant="secondary" onClick={resetUnreadable}>
                Sí, borrar
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <div className="mt-3">
              <Button variant="secondary" onClick={() => setConfirmReset(true)}>
                Borrar y empezar de cero
              </Button>
            </div>
          )}
        </Notice>
      )}

      <section aria-labelledby="nueva-entrada" className="space-y-6">
        <div>
          <p className="text-sm text-ink-muted">
            Paso {step + 1} de {STEPS.length}
          </p>
          <h2 id="nueva-entrada" ref={headingRef} tabIndex={-1} className="text-xl font-semibold focus:outline-none sm:text-2xl">
            {STEPS[step]}
          </h2>
        </div>

        <div aria-live="polite">{showCrisis && <CrisisResources variant="warm" headingLevel="h3" />}</div>

        {step === 0 && (
          <EmotionStep
            emotions={emotions}
            selected={draft.emotions}
            intensity={draft.intensity}
            onToggle={(id) =>
              update({
                emotions: draft.emotions.includes(id)
                  ? draft.emotions.filter((e) => e !== id)
                  : [...draft.emotions, id].slice(0, MAX_EMOTIONS_PER_ENTRY),
              })
            }
            onIntensity={(intensity) => update({ intensity })}
          />
        )}

        {step === 1 && (
          <div className="space-y-5">
            <TextField
              label="¿Qué ha pasado?"
              hint="Opcional. Describe la situación como la contarías a alguien de confianza."
              value={draft.situation}
              onChange={(situation) => update({ situation })}
            />
            <TextField
              label="¿Qué pensamiento te viene a la cabeza?"
              hint="Opcional. Por ejemplo: «no voy a llegar» o «no le importo a nadie»."
              value={draft.thought}
              onChange={(thought) => update({ thought })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <p className="leading-relaxed">
              No se trata de obligarte a pensar en positivo. A veces la emoción encaja con lo que pasa y lo útil es
              cuidarte. Si te apetece, elige una pregunta y responde con calma. También puedes saltarte este paso.
            </p>
            <ChoiceGroup
              legend="Elige una pregunta"
              name="reevaluacion"
              layout="columna"
              value={draft.reappraisalPromptId}
              onChange={(reappraisalPromptId) => update({ reappraisalPromptId })}
              options={prompts.map((prompt) => ({ value: prompt.id, label: prompt.question, description: prompt.hint }))}
            />
            {draft.reappraisalPromptId && (
              <TextField
                label="Tu respuesta"
                value={draft.reappraisalAnswer ?? ""}
                onChange={(reappraisalAnswer) => update({ reappraisalAnswer })}
              />
            )}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={showAfter}
                onChange={(event) => setShowAfter(event.target.checked)}
                className="mt-1 size-5 accent-primary"
              />
              <span>Quiero anotar cómo de intensa noto la emoción ahora (es solo para ti; puede que no cambie, y está bien)</span>
            </label>
            {showAfter && (
              <IntensityField
                label="Intensidad ahora"
                value={draft.intensityAfter ?? draft.intensity}
                onChange={(intensityAfter) => update({ intensityAfter })}
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <dl className="grid gap-3 rounded-xl border border-line p-4">
              <ReviewRow term="Emociones" value={draft.emotions.map((id) => emotionLabel.get(id) ?? id).join(", ")} />
              <ReviewRow term="Intensidad" value={`${draft.intensity} de ${INTENSITY_MAX}`} />
              <ReviewRow term="Situación" value={draft.situation} />
              <ReviewRow term="Pensamiento" value={draft.thought} />
              <ReviewRow
                term="Otro ángulo"
                value={
                  draft.reappraisalAnswer?.trim()
                    ? `${prompts.find((p) => p.id === draft.reappraisalPromptId)?.question ?? ""} ${draft.reappraisalAnswer}`
                    : ""
                }
              />
              {showAfter && <ReviewRow term="Intensidad ahora" value={`${draft.intensityAfter ?? draft.intensity} de ${INTENSITY_MAX}`} />}
            </dl>
            <p className="text-ink-muted">Gracias por tomarte este momento. Ponerle nombre a lo que sientes ya es cuidarte.</p>
            {saveFailed && (
              <div role="alert">
                <Notice tone="aviso">
                  No se ha podido guardar en este navegador (puede que el almacenamiento esté lleno o bloqueado). Tu
                  entrada sigue aquí: puedes reintentar o exportarla a un archivo.
                </Notice>
              </div>
            )}
            {!canSave && (
              <p className="text-ink-muted">Ahora mismo no podemos guardar entradas nuevas. Puedes exportar esta.</p>
            )}
          </div>
        )}

        {stepError && (
          <p role="alert" className="font-medium text-danger">
            {stepError}
          </p>
        )}

        <StickyActions label="Navegación del registro">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </Button>
          )}
          {step < STEPS.length - 1 && <Button onClick={next}>{step === 2 ? "Siguiente o saltar" : "Siguiente"}</Button>}
          {step === STEPS.length - 1 && canSave && <Button onClick={save}>{saveFailed ? "Reintentar" : "Guardar"}</Button>}
          {step === STEPS.length - 1 && (saveFailed || !canSave || journal.status === "no-disponible") && (
            <Button variant="secondary" onClick={exportDraft}>
              Exportar esta entrada
            </Button>
          )}
          <Button variant="secondary" onClick={leave}>
            {touched ? "Salir sin guardar" : "Salir"}
          </Button>
        </StickyActions>
      </section>

      {!unreadable && (
        <JournalEntries
          data={journal.data}
          readOnly={readOnly}
          emotionLabel={emotionLabel}
          prompts={prompts}
          onChange={(data) => {
            if (data.entries.length === 0 ? deleteJournal() : saveJournal(data)) {
              setJournal({ status: data.entries.length === 0 ? "vacio" : "ok", data });
              return true;
            }
            return false;
          }}
        />
      )}
    </div>
  );
}

function EmotionStep({
  emotions,
  selected,
  intensity,
  onToggle,
  onIntensity,
}: {
  emotions: readonly EmotionItem[];
  selected: readonly string[];
  intensity: number;
  onToggle(id: string): void;
  onIntensity(value: number): void;
}) {
  const full = selected.length >= MAX_EMOTIONS_PER_ENTRY;
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-semibold">¿Qué emociones notas? Elige hasta {MAX_EMOTIONS_PER_ENTRY}.</legend>
        <p className="mt-1 text-sm text-ink-muted">
          Ponerle nombre a una emoción suele ayudar a verla con un poco más de distancia. No hay respuestas incorrectas.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {EMOTION_FAMILIES.map((family) => {
            const items = emotions.filter((emotion) => emotion.family === family.id);
            if (items.length === 0) return null;
            return (
              <fieldset key={family.id} className="rounded-xl border border-line p-3">
                <legend className="px-1 text-sm font-semibold">{family.label}</legend>
                <div className="flex flex-wrap gap-2">
                  {items.map((emotion) => {
                    const checked = selected.includes(emotion.id);
                    return (
                      <label
                        key={emotion.id}
                        className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3 py-2 has-checked:border-primary has-checked:bg-surface-2 has-disabled:cursor-not-allowed has-disabled:opacity-60"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && full}
                          onChange={() => onToggle(emotion.id)}
                          className="size-4 accent-primary"
                        />
                        {emotion.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
          {selected.length} de {MAX_EMOTIONS_PER_ENTRY} elegidas
        </p>
      </fieldset>
      <IntensityField label="¿Con cuánta intensidad la notas?" value={intensity} onChange={onIntensity} />
    </div>
  );
}

function IntensityField({ label, value, onChange }: { label: string; value: number; onChange(value: number): void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-4">
        <span aria-hidden="true" className="text-sm text-ink-muted">
          Poca
        </span>
        <input
          id={id}
          type="range"
          min={INTENSITY_MIN}
          max={INTENSITY_MAX}
          step={1}
          value={value}
          aria-valuetext={`${value} de ${INTENSITY_MAX}`}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 w-full accent-primary"
        />
        <span aria-hidden="true" className="text-sm text-ink-muted">
          Mucha
        </span>
        <output htmlFor={id} className="w-14 text-right font-semibold tabular-nums">
          {value}/{INTENSITY_MAX}
        </output>
      </div>
    </div>
  );
}

function TextField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange(value: string): void }) {
  const id = useId();
  const hintId = `${id}-ayuda`;
  return (
    <div>
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        aria-describedby={hint ? hintId : undefined}
        value={value}
        maxLength={MAX_TEXT_LENGTH}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-line-strong bg-surface p-3 leading-relaxed"
      />
    </div>
  );
}

function ReviewRow({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-semibold text-ink-muted">{term}</dt>
      <dd className="whitespace-pre-wrap">{value.trim() || "—"}</dd>
    </div>
  );
}
