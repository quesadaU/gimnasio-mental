"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CARGADORES_HABILIDADES, RUTAS } from "@/content/habilidades";
import { useProgressStore } from "@/components/progress-store-provider";
import {
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
  SessionEndScreen,
} from "@/components/ui";
import type { ReviewCard } from "@/core/types";
import {
  actualDeCola,
  cardIdDePregunta,
  colaTerminada,
  crearCola,
  responderCola,
  seleccionarRepaso,
  separarCardId,
  tarjetasCalificadas,
} from "../domain/repaso";
import { construirSessionResult, deckIdDeRuta, EXERCISE_ID_REPASO } from "../domain/sesion";
import type { Ejercicio } from "../domain/types";
import { EjercicioCard } from "./ejercicio-card";

interface Cargado {
  ejercicios: ReadonlyMap<string, Ejercicio>;
  existentes: readonly ReviewCard[];
  ids: readonly string[];
}

type Carga = { estado: "cargando" } | { estado: "error" } | ({ estado: "listo" } & Cargado);

/** Repaso del día: preguntas vencidas de todas las rutas, intercaladas (práctica intercalada). */
export function RepasoSesion() {
  const store = useProgressStore();
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      const existentes = (
        await Promise.all(RUTAS.map((r) => store.listReviewCards(deckIdDeRuta(r.slug))))
      ).flat();
      const paquetes = await Promise.all(
        RUTAS.map(async (r) => [r.slug, (await CARGADORES_HABILIDADES[r.slug]()).items] as const),
      );
      const ejercicios = new Map<string, Ejercicio>();
      for (const [slug, lecciones] of paquetes) {
        for (const leccion of lecciones) {
          for (const e of leccion.recuperacion) {
            ejercicios.set(cardIdDePregunta(deckIdDeRuta(slug), leccion.id, e.id), e);
          }
        }
      }
      const ids = seleccionarRepaso(existentes, new Date(), new Set(ejercicios.keys())).map((c) => c.id);
      return { ejercicios, existentes, ids };
    })().then(
      (cargado) => {
        if (!cancelado) setCarga({ estado: "listo", ...cargado });
      },
      () => {
        if (!cancelado) setCarga({ estado: "error" });
      },
    );
    return () => {
      cancelado = true;
    };
  }, [store, intento]);

  if (carga.estado === "cargando") return <LoadingState label="Preparando tu repaso…" />;
  if (carga.estado === "error") {
    return (
      <ErrorState
        title="No se pudo preparar el repaso"
        description="Tu progreso no se ha perdido."
        onRetry={() => {
          setCarga({ estado: "cargando" });
          setIntento((n) => n + 1);
        }}
      />
    );
  }
  if (carga.ids.length === 0) {
    return (
      <EmptyState
        title="Nada que repasar hoy"
        description="Cuando completes una lección, sus preguntas de recuperación volverán aquí."
        action={<ButtonLink href="/habilidades">Ir a las rutas</ButtonLink>}
      />
    );
  }
  return <Repaso datos={carga} />;
}

function Repaso({ datos }: { datos: Cargado }) {
  const store = useProgressStore();
  const router = useRouter();
  const total = datos.ids.length;
  const [cola, setCola] = useState(() => crearCola(datos.ids));
  const [turno, setTurno] = useState(0);
  const [guardado, setGuardado] = useState<"idle" | "guardando" | "error" | "hecho">("idle");
  const [sessionId] = useState(() => crypto.randomUUID());
  const inicio = useRef<Date>(null);
  if (inicio.current === null) inicio.current = new Date();
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const terminado = colaTerminada(cola);
  const resultados = Object.values(cola.primerIntento);
  const recordadas = resultados.filter(Boolean).length;

  useEffect(() => {
    tituloRef.current?.focus();
  }, [turno]);

  async function guardar() {
    setGuardado("guardando");
    try {
      const ahora = new Date();
      const tarjetas = tarjetasCalificadas(cola, datos.existentes, separarCardId, ahora);
      await store.upsertReviewCards(tarjetas);
      await store.recordSession(
        construirSessionResult({
          id: sessionId,
          exerciseId: EXERCISE_ID_REPASO,
          contentId: "repaso",
          startedAt: (inicio.current ?? ahora).toISOString(),
          endedAt: ahora.toISOString(),
          trials: resultados.length,
          correct: recordadas,
          nivel: 1,
        }),
      );
      setGuardado("hecho");
    } catch {
      setGuardado("error");
    }
  }

  if (guardado === "hecho") {
    return (
      <SessionEndScreen
        title="Repaso terminado"
        summary={[
          { label: "Repasadas", value: resultados.length },
          { label: "Acertadas a la primera", value: `${recordadas}/${resultados.length}` },
        ]}
        nextHint="Lo que fallaste volverá antes; lo que acertaste, más espaciado."
        onExit={() => router.push("/habilidades")}
      />
    );
  }

  if (terminado) {
    return (
      <Card as="section" aria-label="Fin del repaso">
        <CardBody>
          <div className="flex flex-col gap-4">
            <p className="text-ink">
              Has terminado: {recordadas} de {resultados.length} a la primera.
            </p>
            {guardado === "error" ? (
              <ErrorState
                title="No se pudo guardar el repaso"
                description="Tus resultados siguen en pantalla. Puedes reintentar."
                onRetry={() => void guardar()}
              />
            ) : null}
            <div>
              <Button size="lg" onClick={() => void guardar()} disabled={guardado === "guardando"}>
                {guardado === "guardando" ? "Guardando…" : "Guardar y terminar"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const actual = actualDeCola(cola);
  const ejercicio = actual ? datos.ejercicios.get(actual) : undefined;
  if (!actual || !ejercicio) return null;
  return (
    <Card as="section" aria-labelledby="repaso-titulo">
      <CardHeader>
        <h2 id="repaso-titulo" ref={tituloRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Pregunta {Math.min(resultados.length + 1, total)} de {total}
        </h2>
        <ProgressBar value={resultados.length} max={total} label="Preguntas repasadas" hideLabel />
      </CardHeader>
      <CardBody>
        <EjercicioCard
          key={`${actual}-${turno}`}
          ejercicio={ejercicio}
          onContinuar={(correcto) => {
            setCola((c) => responderCola(c, correcto));
            setTurno((t) => t + 1);
          }}
        />
      </CardBody>
    </Card>
  );
}
