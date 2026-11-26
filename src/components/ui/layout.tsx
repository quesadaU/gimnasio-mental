import type { ReactNode } from "react";
import { cx } from "./cx";

interface ContainerProps {
  size?: "md" | "lg";
  className?: string;
  children: ReactNode;
}

/** md: columna de lectura/ejercicio (~768 px). lg: rejillas y catálogos (~1152 px). */
export function Container({ size = "lg", className, children }: ContainerProps) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-4 sm:px-6",
        size === "md" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Acciones o metadatos (botones, insignias) que acompañan al título. */
  children?: ReactNode;
}

/** Cabecera de página con el único h1. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 pb-8 pt-8 sm:pt-12">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      ) : null}
      <h1 className="text-4xl font-semibold text-ink sm:text-5xl">{title}</h1>
      {description ? (
        <div className="max-w-2xl text-lg text-ink-muted">{description}</div>
      ) : null}
      {children ? <div className="flex flex-wrap items-center gap-3 pt-1">{children}</div> : null}
      <div aria-hidden="true" className="gm-ticks mt-2 w-40" />
    </header>
  );
}
