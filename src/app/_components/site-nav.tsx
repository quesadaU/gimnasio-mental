"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Badge, cx } from "@/components/ui";
import { MODULES } from "@/core/modules-registry";
import type { ModuleDefinition, ModuleSlug } from "@/core/types";

/** Etiquetas cortas para la barra; el resto de la app usa el título completo de MODULES. */
const SHORT_LABELS: Partial<Record<ModuleSlug, string>> = {
  patio: "Patio",
  bienestar: "Bienestar",
  recompensas: "Recompensas",
};

function navLabel(module: ModuleDefinition): string {
  return SHORT_LABELS[module.slug] ?? module.title;
}

function isCurrent(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lee la ruta actual. Va dentro de <Suspense> en el layout (cacheComponents + rutas dinámicas). */
export function SiteNav() {
  return <SiteNavView pathname={usePathname()} />;
}

/** Vista sin hooks de URL: sirve también como fallback estático (sin enlace activo marcado). */
export function SiteNavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav aria-label="Principal" className="flex items-center">
      {/* Escritorio */}
      <ul className="hidden items-center gap-1 lg:flex">
        {MODULES.map((module) => (
          <li key={module.slug}>
            <NavItem module={module} pathname={pathname} variant="bar" />
          </li>
        ))}
      </ul>

      {/* Móvil: menú desplegable (no barra inferior fija, para no tapar los controles de los ejercicios). */}
      <div className="lg:hidden">
        <button
          ref={toggleRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-semibold text-ink hover:bg-surface-2"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
            )}
          </svg>
          {open ? "Cerrar" : "Menú"}
        </button>
        <div
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-card"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {MODULES.map((module) => (
              <li key={module.slug}>
                <NavItem
                  module={module}
                  pathname={pathname}
                  variant="panel"
                  onNavigate={() => setOpen(false)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  module,
  pathname,
  variant,
  onNavigate,
}: {
  module: ModuleDefinition;
  pathname: string | null;
  variant: "bar" | "panel";
  onNavigate?: () => void;
}) {
  const base =
    variant === "bar"
      ? "inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-[0.95rem]"
      : "flex min-h-12 items-center justify-between gap-3 rounded-md px-3 text-lg";
  const label = variant === "bar" ? navLabel(module) : module.title;

  if (module.status === "proximamente") {
    return (
      <span aria-disabled="true" className={cx(base, "cursor-not-allowed text-ink-muted")}>
        {label}
        <Badge>Próximamente</Badge>
      </span>
    );
  }

  const current = isCurrent(pathname, module.href);
  return (
    <Link
      href={module.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cx(
        base,
        "font-semibold transition-colors",
        current
          ? "bg-surface-2 text-ink shadow-[inset_0_-2px_0_var(--gm-accent)]"
          : "text-ink-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
