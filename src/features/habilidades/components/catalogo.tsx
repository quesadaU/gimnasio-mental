"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RUTAS } from "@/content/habilidades";
import { useProgressStore } from "@/components/progress-store-provider";
import { ButtonLink, Card, CardBody, ProgressBar } from "@/components/ui";
import { isDue } from "@/core/spaced-repetition";
import type { SessionResult } from "@/core/types";
import { progresoRuta } from "../domain/progreso";
import { MODULO } from "../domain/sesion";

/** Catálogo de rutas con su progreso y aviso del repaso del día. */
export function Catalogo() {
  const store = useProgressStore();
  const [sesiones, setSesiones] = useState<readonly SessionResult[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      store.listSessions({ module: MODULO }),
      Promise.all(RUTAS.map((r) => store.listReviewCards(`${MODULO}:${r.slug}`))),
    ]).then(
      ([ses, mazos]) => {
        if (cancelado) return;
        const ahora = new Date();
        setSesiones(ses);
        setPendientes(mazos.flat().filter((c) => isDue(c, ahora)).length);
      },
      () => {
        if (!cancelado) setError(true);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [store]);

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">Repaso del día</h2>
              <p className="text-ink-muted">
                {pendientes > 0
                  ? `Tienes ${pendientes} ${pendientes === 1 ? "pregunta" : "preguntas"} para recordar hoy, mezcladas de varias rutas.`
                  : "No hay preguntas pendientes de repaso ahora mismo."}
              </p>
            </div>
            {pendientes > 0 ? <ButtonLink href="/habilidades/repaso">Empezar repaso</ButtonLink> : null}
          </div>
        </CardBody>
      </Card>

      {error ? (
        <p role="status" className="rounded-md bg-warning-soft px-4 py-3 text-warning">
          No se pudo leer tu historial: no se mostrará tu progreso.
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2">
        {RUTAS.map((ruta) => {
          const { completadas, total } = progresoRuta(ruta, sesiones);
          return (
            <li key={ruta.slug}>
              <Card className="h-full">
                <CardBody>
                  <div className="flex h-full flex-col gap-3">
                    <h3 className="text-xl font-semibold text-ink">
                      <Link
                        href={`/habilidades/${ruta.slug}`}
                        className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                      >
                        {ruta.titulo}
                      </Link>
                    </h3>
                    <p className="text-ink-muted">{ruta.descripcion}</p>
                    <div className="mt-auto">
                      <ProgressBar
                        value={completadas}
                        max={total}
                        label={`${completadas} de ${total} lecciones`}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
