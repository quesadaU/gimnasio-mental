"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CARGADORES_HABILIDADES } from "@/content/habilidades";
import { useProgressStore } from "@/components/progress-store-provider";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  LoadingState,
  ProgressBar,
  SessionEndScreen,
} from "@/components/ui";
import { isPersistenceAvailable } from "@/core/storage";
import { actualDeCola, cardIdDePregunta, colaTerminada, crearCola, responderCola, separarCardId, tarjetasCalificadas } from "../domain/repaso";
import {
  construirSessionResult,
  deckIdDeRuta,
  exerciseIdDeLeccion,
  FASES,
  marcadorVacio,
  puedeVerSolucion,
  registrarIntento,
  resumenMarcador,
  siguienteFase,
  verPista,
  type Fase,
} from "../domain/sesion";
import type { Ejercicio, Leccion, RutaSlug } from "../domain/types";
import { EjercicioCard } from "./ejercicio-card";

const TITULO_FASE: Record<Fase, string> = {
  explicacion: "Explicación",
  intento: "Inténtalo primero",
  ejercicios: "Ejercicios",
  recuperacion: "Recuperación",
  resumen: "Resumen",
};

/** Carga la lección del paquete de su ruta (un chunk por ruta) y monta el ciclo de aprendizaje. */
export function LeccionSesion({ ruta, leccionId }: { ruta: RutaSlug; leccionId: string }) {
  const [intento, setIntento] = useState(0);
  const [leccion, setLeccion] = useState<Leccion | null | undefined>(undefined);

  useEffect(() => {
    let cancelado = false;
    CARGADORES_HABILIDADES[ruta]().then(
      (paquete) => {
        if (!cancelado) setLeccion(paquete.items.find((l) => l.id === leccionId) ?? null);
      },
      () => {
        if (!cancelado) setLeccion(null);
      },
    );
    return () => {
      cancelado = true;
    };
  }, [ruta, leccionId, intento]);

  if (leccion === undefined) return <LoadingState label="Preparando la lección…" />;
  if (leccion === null) {
    return (
      <ErrorState
        title="No se pudo cargar la lección"
        description="Puede deberse a la conexión. No se ha perdido nada."
        onRetry={() => {
          setLeccion(undefined);
          setIntento((n) => n + 1);
        }}
      />
    );
  }
  return <Ciclo key={leccion.id} ruta={ruta} leccion={leccion} />;
}

function Ciclo({ ruta, leccion }: { ruta: RutaSlug; leccion: Leccion }) {
  const store = useProgressStore();
  const router = useRouter();
  const deckId = deckIdDeRuta(ruta);
  const [fase, setFase] = useState<Fase>("explicacion");
  const [marcador, setMarcador] = useState(marcadorVacio);
  const [indice, setIndice] = useState(0);
  const [turno, setTurno] = useState(0);
  const [cola, setCola] = useState(() =>
    crearCola(leccion.recuperacion.map((e) => cardIdDePregunta(deckId, leccion.id, e.id))),
  );
  const [guardado, setGuardado] = useState<"idle" | "guardando" | "error" | "hecho">("idle");
  const [persistente, setPersistente] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID());
  const inicio = useRef<Date>(null);
  if (inicio.current === null) inicio.current = new Date();
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, [fase]);

  const recuperacionPorCard = useMemo(
    () => new Map(leccion.recuperacion.map((e) => [cardIdDePregunta(deckId, leccion.id, e.id), e])),
    [leccion, deckId],
  );

  const guardar = useCallback(async () => {
    setGuardado("guardando");
    try {
      const ahora = new Date();
      const e = resumenMarcador(marcador);
      const r = Object.values(cola.primerIntento);
      const existentes = await store.listReviewCards(deckId);
      const tarjetas = tarjetasCalificadas(cola, existentes, separarCardId, ahora);
      if (tarjetas.length > 0) await store.upsertReviewCards(tarjetas);
      await store.recordSession(
        construirSessionResult({
          id: sessionId,
          exerciseId: exerciseIdDeLeccion(ruta, leccion.id),
          contentId: leccion.id,
          startedAt: (inicio.current ?? ahora).toISOString(),
          endedAt: ahora.toISOString(),
          trials: e.trials + r.length,
          correct: e.correct + r.filter(Boolean).length,
          nivel: leccion.nivel,
        }),
      );
      setPersistente(isPersistenceAvailable());
      setGuardado("hecho");
    } catch {
      setGuardado("error");
    }
  }, [marcador, cola, store, deckId, sessionId, ruta, leccion]);

  if (guardado === "hecho") {
    const e = resumenMarcador(marcador);
    const r = Object.values(cola.primerIntento);
    return (
      <SessionEndScreen
        title="Lección terminada"
        summary={[
          { label: "Ejercicios", value: `${e.correct}/${e.trials}` },
          { label: "Recuperación", value: `${r.filter(Boolean).length}/${r.length}` },
        ]}
        nextHint={
          persistente
            ? "Las preguntas de recuperación volverán en tu repaso, espaciadas en el tiempo."
            : "Este navegador no permite guardar datos: el repaso solo durará hasta que cierres la pestaña."
        }
        onExit={() => router.push(`/habilidades/${ruta}`)}
      />
    );
  }

  const numeroFase = FASES.indexOf(fase) + 1;
  const cabecera = (
    <CardHeader>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
        Fase {numeroFase} de {FASES.length}
      </p>
      <h2 ref={tituloRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
        {TITULO_FASE[fase]}
      </h2>
      <ProgressBar value={numeroFase - 1} max={FASES.length} label="Progreso de la lección" hideLabel />
    </CardHeader>
  );
  const envolver = (contenido: ReactNode) => (
    <Card as="section" aria-label={TITULO_FASE[fase]}>
      {cabecera}
      <CardBody>{contenido}</CardBody>
    </Card>
  );

  if (fase === "explicacion") {
    return envolver(
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="font-semibold text-ink">Qué vas a aprender</h3>
          <ul className="list-disc pl-5 text-ink-muted">
            {leccion.objetivos.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
        {leccion.explicacion.map((p) => (
          <p key={p} className="text-ink">
            {p}
          </p>
        ))}
        <div className="rounded-lg bg-surface-2 p-4">
          <h3 className="font-semibold text-ink">Ejemplo resuelto</h3>
          <p className="mt-1 text-ink">{leccion.ejemplo.enunciado}</p>
          {leccion.ejemplo.codigo ? (
            <pre className="mt-2 overflow-x-auto rounded-md bg-canvas p-3 text-sm text-ink" tabIndex={0}>
              <code>{leccion.ejemplo.codigo}</code>
            </pre>
          ) : null}
          <ol className="mt-2 list-decimal pl-5 text-ink-muted">
            {leccion.ejemplo.pasos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
        <div>
          <Button onClick={() => setFase(siguienteFase(fase))}>Continuar</Button>
        </div>
      </div>,
    );
  }

  if (fase === "intento") {
    return envolver(<Intento leccion={leccion} onContinuar={() => setFase(siguienteFase(fase))} />);
  }

  if (fase === "ejercicios") {
    const ejercicio: Ejercicio | undefined = leccion.ejercicios[indice];
    if (!ejercicio) {
      // Lección sin ejercicios: se pasa directamente a la fase siguiente.
      return envolver(
        <Button onClick={() => setFase(siguienteFase(fase))}>Continuar</Button>,
      );
    }
    const ultimo = indice === leccion.ejercicios.length - 1;
    return envolver(
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Ejercicio {indice + 1} de {leccion.ejercicios.length}
        </p>
        <EjercicioCard
          key={ejercicio.id}
          ejercicio={ejercicio}
          onCorregido={(c) => setMarcador((m) => registrarIntento(m, ejercicio.id, c.correcto))}
          onContinuar={() => {
            if (ultimo) {
              setFase(siguienteFase(fase));
            } else {
              setIndice(indice + 1);
            }
          }}
          textoContinuar={ultimo ? "Pasar a la recuperación" : "Siguiente ejercicio"}
        />
      </div>,
    );
  }

  if (fase === "recuperacion") {
    const actual = actualDeCola(cola);
    const ejercicio = actual ? recuperacionPorCard.get(actual) : undefined;
    if (colaTerminada(cola) || !actual || !ejercicio) {
      return envolver(
        <div className="flex flex-col gap-4">
          <p className="text-ink">Has recuperado todas las ideas de esta lección.</p>
          <div>
            <Button onClick={() => setFase(siguienteFase(fase))}>Ver el resumen</Button>
          </div>
        </div>,
      );
    }
    const total = leccion.recuperacion.length;
    return envolver(
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-muted">
          Responde de memoria, sin volver atrás. Pendientes: {cola.pendientes.length} de {total}
          {cola.pendientes.length > total ? " (incluye repeticiones)" : ""}.
        </p>
        <EjercicioCard
          key={`${actual}-${turno}`}
          ejercicio={ejercicio}
          onContinuar={(correcto) => {
            setCola((c) => responderCola(c, correcto));
            setTurno((t) => t + 1);
          }}
        />
      </div>,
    );
  }

  return envolver(
    <div className="flex flex-col gap-4">
      <ul className="list-disc pl-5 text-ink">
        {leccion.resumen.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      {guardado === "error" ? (
        <ErrorState
          title="No se pudo guardar la sesión"
          description="Tus resultados siguen en pantalla. Puedes reintentar."
          onRetry={() => void guardar()}
        />
      ) : null}
      <div role="status" aria-live="polite" className="text-sm text-ink-muted">
        {guardado === "guardando" ? "Guardando…" : null}
      </div>
      <div>
        <Button size="lg" onClick={() => void guardar()} disabled={guardado === "guardando"}>
          Guardar y terminar
        </Button>
      </div>
    </div>,
  );
}

/** Fase de intento: se prueba antes de ver la solución; las pistas se piden de una en una. */
function Intento({ leccion, onContinuar }: { leccion: Leccion; onContinuar: () => void }) {
  const [estado, setEstado] = useState({ pistasVistas: 0, intentado: false });
  const { ejercicio, pistas, solucion } = leccion.intento;
  const solucionVisible = puedeVerSolucion(estado);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-muted">
        Esta no puntúa. Equivocarte aquí ayuda a aprender: intenta resolverlo antes de mirar la solución.
      </p>
      <EjercicioCard
        ejercicio={ejercicio}
        onCorregido={() => setEstado((e) => ({ ...e, intentado: true }))}
        onContinuar={onContinuar}
        textoContinuar="Continuar con los ejercicios"
      />
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        {pistas.slice(0, estado.pistasVistas).map((pista, i) => (
          <p key={pista} className="rounded-md bg-surface-2 px-3 py-2 text-ink">
            <span className="font-semibold">Pista {i + 1}:</span> {pista}
          </p>
        ))}
        {estado.pistasVistas < pistas.length ? (
          <div>
            <Button variant="secondary" onClick={() => setEstado(verPista)}>
              Ver pista ({estado.pistasVistas + 1} de {pistas.length})
            </Button>
          </div>
        ) : null}
        {solucionVisible ? (
          <div className="rounded-lg border-l-4 border-accent bg-canvas px-4 py-3" role="status">
            <p className="font-semibold text-ink">Solución paso a paso</p>
            <ol className="list-decimal pl-5 text-ink-muted">
              {solucion.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div className="mt-3">
              <Button onClick={onContinuar}>Continuar con los ejercicios</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            La solución se desbloquea tras responder o tras ver las {pistas.length} pistas.
          </p>
        )}
      </div>
    </div>
  );
}
