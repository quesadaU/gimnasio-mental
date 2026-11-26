"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

const DANGER_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-danger px-5 font-semibold leading-none " +
  "text-canvas transition-[filter] duration-150 hover:brightness-110";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" para acciones destructivas (borrar datos). */
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo modal de confirmación sobre <dialog> nativo: atrapa el foco, cierra con Escape
 * y devuelve el foco al elemento que lo abrió. El foco inicial va a "Cancelar" (opción segura).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-xl border border-line bg-surface p-0 text-ink shadow-card backdrop:bg-black/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-2xl font-semibold">
          {title}
        </h2>
        {description ? (
          <div id={descriptionId} className="text-ink-muted">
            {description}
          </div>
        ) : null}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          {tone === "danger" ? (
            <button type="button" onClick={onConfirm} className={DANGER_BUTTON}>
              {confirmLabel}
            </button>
          ) : (
            <Button variant="primary" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
