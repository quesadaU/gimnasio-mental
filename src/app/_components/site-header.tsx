import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { SiteNav, SiteNavView } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/92 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-2.5 rounded-md font-display text-xl font-semibold text-ink"
        >
          <BrandMark />
          <span>
            Gimnasio <span className="text-accent">Mental</span>
          </span>
        </Link>
        <Suspense fallback={<SiteNavView pathname={null} />}>
          <SiteNav />
        </Suspense>
      </Container>
    </header>
  );
}

/** Marca: un disco de pesas visto de frente, con las marcas de serie del sistema visual. */
function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
      <circle cx="16" cy="16" r="14" fill="var(--gm-primary)" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="var(--gm-primary-ink)" strokeWidth="1.5" strokeOpacity="0.7" />
      <circle cx="16" cy="16" r="3" fill="var(--gm-accent)" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="16"
          y1="3.5"
          x2="16"
          y2="5.5"
          stroke="var(--gm-primary-ink)"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  );
}
