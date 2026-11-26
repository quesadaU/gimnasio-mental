"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProgressStore } from "@/components/progress-store-provider";
import { Badge, Card, CardBody } from "@/components/ui";
import type { SessionResult } from "@/core/types";
import { estadosLecciones, mejorPuntuacion, type EstadoLeccion } from "../domain/progreso";
import { MODULO } from "../domain/sesion";
import type { RutaDefinicion } from "../domain/types";

const ETIQUETA: Record<EstadoLeccion, { texto: string; tono: "success" | "info" | "neutral" }> = {
  completada: { texto: "Completada", tono: "success" },
  siguiente: { texto: "Recomendada", tono: "info" },
  pendiente: { texto: "Pendiente", tono: "neutral" },
};

/** Temario de una ruta. Ninguna lección se bloquea; se recomienda la primera pendiente. */
export function Temario({ ruta }: { ruta: RutaDefinicion }) {
  const store = useProgressStore();
  const [sesiones, setSesiones] = useState<readonly SessionResult[]>([]);

  useEffect(() => {
    let cancelado = false;
    store.listSessions({ module: MODULO }).then(
      (s) => {
        if (!cancelado) setSesiones(s);
      },
      () => undefined,
    );
    return () => {
      cancelado = true;
    };
  }, [store]);

  const estados = estadosLecciones(ruta, sesiones);
  return (
    <ol className="flex flex-col gap-3">
      {ruta.lecciones.map((leccion, i) => {
        const estado = estados[leccion.id] ?? "pendiente";
        const mejor = mejorPuntuacion(ruta, leccion.id, sesiones);
        return (
          <li key={leccion.id}>
            <Card>
              <CardBody>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={ETIQUETA[estado].tono}>{ETIQUETA[estado].texto}</Badge>
                    <span className="text-sm text-ink-muted">
                      {leccion.minutos} min{mejor !== undefined ? ` · mejor puntuación ${mejor}%` : ""}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink">
                    <Link
                      href={`/habilidades/${ruta.slug}/${leccion.id}`}
                      className="underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2"
                    >
                      {i + 1}. {leccion.titulo}
                    </Link>
                  </h3>
                  <p className="text-ink-muted">{leccion.descripcion}</p>
                </div>
              </CardBody>
            </Card>
          </li>
        );
      })}
    </ol>
  );
}
