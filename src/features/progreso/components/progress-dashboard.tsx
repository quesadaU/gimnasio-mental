"use client";

import { useId, useRef, useState } from "react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Stat,
} from "@/components/ui";
import { PROGRESS_SCHEMA_VERSION, isPersistenceAvailable } from "@/core/storage";
import type { DifficultyLevel, ProgressSnapshot, ProgressStore } from "@/core/types";
import {
  backupFileName,
  createBackup,
  isEmptyPlan,
  parseBackup,
  planImport,
  type ParseBackupError,
} from "../domain/backup.ts";
import { recentSessions, sessionMinutes, summarizeProgress } from "../domain/summary.ts";
import { formatDateTime, formatMinutes, humanizeId, moduleTitle } from "./format";
import { trainingModules } from "./training-modules";
import { useStoreData } from "./use-store-data";

const RECENT_LIMIT = 10;

async function readDashboard(store: ProgressStore) {
  return { snapshot: await store.getSnapshot(), persistent: isPersistenceAvailable() };
}

const IMPORT_ERRORS: Record<ParseBackupError, string> = {
  "demasiado-grande": "El archivo es demasiado grande para ser una copia de Gimnasio Mental.",
  "json-invalido": "El archivo no es un JSON válido.",
  "formato-desconocido": "El archivo no parece una copia de progreso de Gimnasio Mental.",
  "version-futura": "La copia es de una versión más nueva de la app. Actualiza la página e inténtalo de nuevo.",
};

type Notice = { tone: "success" | "error"; text: string } | null;

export function ProgressDashboard() {
  const { state, reload, store } = useStoreData(readDashboard);
  const [notice, setNotice] = useState<Notice>(null);

  if (state.status === "loading") return <LoadingState label="Cargando tu historial…" />;
  if (state.status === "error") {
    return (
      <ErrorState
        title="No hemos podido leer tu progreso"
        description="Puede que el navegador esté bloqueando el almacenamiento local."
        onRetry={reload}
      />
    );
  }

  const { snapshot, persistent } = state.data;

  return (
    <div className="flex flex-col gap-10">
      {!persistent ? (
        <div role="note" className="rounded-lg border border-warning/50 bg-warning-soft p-4 text-ink">
          <strong className="text-warning">Este navegador no permite guardar datos.</strong> Puedes entrenar,
          pero tus sesiones se perderán al cerrar o recargar la página (por ejemplo, en modo privado).
        </div>
      ) : null}

      <ProgressOverview snapshot={snapshot} />

      <DataSection
        snapshot={snapshot}
        store={store}
        onChanged={reload}
        notice={notice}
        setNotice={setNotice}
      />
    </div>
  );
}

function ProgressOverview({ snapshot }: { snapshot: ProgressSnapshot }) {
  const summary = summarizeProgress(snapshot.sessions);
  const modules = trainingModules();

  if (summary.totalSessions === 0) {
    return (
      <EmptyState
        title="Todavía no hay sesiones"
        description="Cuando termines tu primera sesión en cualquier módulo, aparecerá aquí. Se guarda solo en este navegador."
        action={<ButtonLink href="/">Ver la sesión recomendada</ButtonLink>}
      />
    );
  }

  const recent = recentSessions(snapshot.sessions, RECENT_LIMIT);

  return (
    <>
      <section aria-labelledby="resumen" className="flex flex-col gap-4">
        <h2 id="resumen" className="text-2xl font-semibold text-ink">
          Resumen
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Sesiones" value={summary.totalSessions} />
          <Stat
            label="Completadas"
            value={summary.completedSessions}
            hint={`${summary.totalSessions - summary.completedSessions} sin terminar`}
          />
          <Stat label="Tiempo de práctica" value={formatMinutes(summary.totalMinutes)} />
          <Stat label="Días con práctica" value={summary.activeDays} hint="Constancia, no maratones" />
        </div>
      </section>

      <section aria-labelledby="por-modulo" className="flex flex-col gap-4">
        <h2 id="por-modulo" className="text-2xl font-semibold text-ink">
          Por módulo
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {modules.map((module) => {
            const data = summary.byModule.find((item) => item.module === module.slug);
            return (
              <li key={module.slug} className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface p-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">{module.title}</span>
                  <span className="text-sm text-ink-muted">
                    {data ? `Última: ${formatDateTime(data.lastEndedAt)}` : "Sin sesiones todavía"}
                  </span>
                </div>
                <div className="text-right tabular-nums">
                  <span className="block font-display text-2xl font-semibold text-ink">{data?.sessions ?? 0}</span>
                  <span className="block text-sm text-ink-muted">{formatMinutes(data?.minutes ?? 0)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="ultimas" className="flex flex-col gap-4">
        <h2 id="ultimas" className="text-2xl font-semibold text-ink">
          Últimas sesiones
        </h2>
        <ol className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
          {recent.map((session) => (
            <li key={session.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-ink">{humanizeId(session.exerciseId)}</span>
                <span className="text-sm text-ink-muted">
                  {moduleTitle(session.module)} · {formatDateTime(session.endedAt)} ·{" "}
                  {formatMinutes(sessionMinutes(session))}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {session.trials > 0 ? (
                  <span className="tabular-nums text-ink-muted">
                    {session.correct}/{session.trials} aciertos
                  </span>
                ) : null}
                <span className="tabular-nums text-ink-muted">Nivel {session.difficultyEnd}</span>
                <Badge tone={session.outcome === "completada" ? "success" : "neutral"}>
                  {session.outcome === "completada" ? "Completada" : "Sin terminar"}
                </Badge>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

interface DataSectionProps {
  snapshot: ProgressSnapshot;
  store: ProgressStore;
  onChanged: () => void;
  notice: Notice;
  setNotice: (notice: Notice) => void;
}

function DataSection({ snapshot, store, onChanged, notice, setNotice }: DataSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const hasData = snapshot.sessions.length > 0 || Object.keys(snapshot.reviewCards).length > 0;

  function handleExport() {
    const now = new Date();
    const backup = createBackup(snapshot, PROGRESS_SCHEMA_VERSION, now);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backupFileName(now);
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ tone: "success", text: "Copia descargada. Guárdala donde quieras: no sale de tu dispositivo." });
  }

  async function handleImport(file: File) {
    setBusy(true);
    try {
      const parsed = parseBackup(await file.text(), PROGRESS_SCHEMA_VERSION);
      if (!parsed.ok) {
        setNotice({ tone: "error", text: IMPORT_ERRORS[parsed.error] });
        return;
      }
      const plan = planImport(await store.getSnapshot(), parsed.snapshot);
      if (isEmptyPlan(plan)) {
        setNotice({ tone: "success", text: "La copia no tenía nada nuevo: tus datos ya estaban al día." });
        return;
      }
      for (const session of plan.sessions) await store.recordSession(session);
      for (const record of plan.difficulty) {
        await store.setDifficulty(record.exerciseId, record.level as DifficultyLevel);
      }
      if (plan.reviewCards.length > 0) await store.upsertReviewCards(plan.reviewCards);
      setNotice({
        tone: "success",
        text: `Importación completada: ${plan.sessions.length} sesiones nuevas y ${plan.reviewCards.length} tarjetas de repaso.`,
      });
      onChanged();
    } catch {
      setNotice({ tone: "error", text: "No se pudo leer el archivo. Inténtalo con otra copia." });
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleReset() {
    setConfirmOpen(false);
    try {
      await store.reset();
      setNotice({ tone: "success", text: "Datos borrados de este navegador." });
      onChanged();
    } catch {
      setNotice({ tone: "error", text: "No se pudieron borrar los datos." });
    }
  }

  return (
    <Card as="section" aria-labelledby="tus-datos">
      <CardHeader>
        <CardTitle as="h2" id="tus-datos">
          Tus datos
        </CardTitle>
      </CardHeader>
      <CardBody className="gap-5">
        <p>
          Todo tu progreso vive <strong className="text-ink">solo en este navegador</strong>: no hay cuentas
          ni servidor. Si borras los datos del navegador o cambias de dispositivo, se pierde. Descarga una copia
          de vez en cuando; al importarla se fusiona con lo que ya tienes, sin sustituirlo.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="secondary" onClick={handleExport} disabled={busy}>
            Descargar copia (JSON)
          </Button>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
            }}
          />
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={busy}>
            {busy ? "Importando…" : "Importar copia"}
          </Button>
          <Button variant="ghost" onClick={() => setConfirmOpen(true)} disabled={busy || !hasData}>
            Borrar mis datos…
          </Button>
        </div>

        <div role="status" aria-live="polite" className="min-h-6">
          {notice ? (
            <p className={notice.tone === "error" ? "font-semibold text-danger" : "font-semibold text-success"}>
              {notice.text}
            </p>
          ) : null}
        </div>
      </CardBody>

      <ConfirmDialog
        open={confirmOpen}
        tone="danger"
        title="¿Borrar todo tu progreso?"
        description={
          <p>
            Se eliminarán las {snapshot.sessions.length} sesiones, los niveles de dificultad y las tarjetas de
            repaso guardados en este navegador. No se puede deshacer. Si quieres conservarlos, descarga antes
            una copia.
          </p>
        }
        confirmLabel="Sí, borrar mis datos"
        onConfirm={() => void handleReset()}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
  );
}
