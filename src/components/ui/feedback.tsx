import { useId, type ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./cx";

interface ProgressBarProps {
  value: number;
  max: number;
  /** Nombre accesible y etiqueta visible (por ejemplo "Ensayo"). */
  label: string;
  /** Oculta visualmente la etiqueta (sigue disponible para lectores de pantalla). */
  hideLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max, label, hideLabel = false, className }: ProgressBarProps) {
  const labelId = useId();
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const percent = Math.round((clamped / safeMax) * 100);
  const valueText = `${clamped} de ${safeMax}`;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <div className={cx("flex items-baseline justify-between gap-3 text-sm", hideLabel && "sr-only")}>
        <span id={labelId} className="font-semibold text-ink">
          {label}
        </span>
        <span className="tabular-nums text-ink-muted" aria-hidden="true">
          {valueText}
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-valuetext={valueText}
        className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line-strong/40"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export type BadgeTone = "neutral" | "info" | "success" | "warning";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-muted",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col gap-1 rounded-lg border border-line bg-surface p-4", className)}>
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="font-display text-3xl font-semibold tabular-nums text-ink">{value}</span>
      {hint ? <span className="text-sm text-ink-muted">{hint}</span> : null}
    </div>
  );
}

/** Indicador giratorio. Con movimiento reducido queda como un anillo estático. */
export function Spinner({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cx("inline-flex items-center", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="gm-spin size-5 text-primary"
        fill="none"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingState({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx("flex items-center gap-3 rounded-lg px-1 py-6 text-ink-muted", className)}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="gm-spin size-5 text-primary" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-start gap-3 rounded-lg border border-dashed border-line-strong/60 bg-surface/60 p-6",
        className,
      )}
    >
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {description ? <div className="text-ink-muted">{description}</div> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title: string;
  description?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cx(
        "flex flex-col items-start gap-3 rounded-lg border border-danger/40 bg-danger-soft p-6",
        className,
      )}
    >
      <p className="font-display text-xl font-semibold text-danger">{title}</p>
      {description ? <div className="text-ink">{description}</div> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
