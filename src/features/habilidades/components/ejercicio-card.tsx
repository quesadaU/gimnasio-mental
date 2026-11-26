"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { barajarDeterminista, corregir } from "../domain/correccion";
import type { Correccion, Ejercicio, Respuesta } from "../domain/types";

interface EjercicioCardProps {
  ejercicio: Ejercicio;
  /** Se llama una vez al comprobar. */
  onCorregido?: (correccion: Correccion) => void;
  /** Se llama al pulsar el botón de avanzar tras ver la corrección. */
  onContinuar: (correcto: boolean) => void;
  textoContinuar?: string;
}

/**
 * Un ejercicio de cualquier tipo: se responde, se comprueba y se muestra siempre la explicación.
 * Instancia nueva por ejercicio (usa `key={ejercicio.id}` o similar en quien lo monta).
 */
export function EjercicioCard({
  ejercicio,
  onCorregido,
  onContinuar,
  textoContinuar = "Continuar",
}: EjercicioCardProps) {
  const grupo = useId();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [correccion, setCorreccion] = useState<(Correccion & { huecos?: boolean[] }) | null>(null);

  const [opcion, setOpcion] = useState("");
  const [valor, setValor] = useState("");
  const [orden, setOrden] = useState<string[]>(() =>
    ejercicio.tipo === "ordenar" ? barajarDeterminista(ejercicio.pasos, ejercicio.id).map((p) => p.id) : [],
  );
  const [huecos, setHuecos] = useState<string[]>(() =>
    ejercicio.tipo === "completar-codigo" ? ejercicio.huecos.map(() => "") : [],
  );
  const [vf, setVf] = useState<boolean | null>(null);
  const [justificacion, setJustificacion] = useState("");

  useEffect(() => {
    if (correccion) feedbackRef.current?.focus();
  }, [correccion]);

  const respuesta = useMemo((): Respuesta | null => {
    switch (ejercicio.tipo) {
      case "opcion-multiple":
        return opcion ? { tipo: "opcion-multiple", opcion } : null;
      case "numerica":
        return valor.trim() ? { tipo: "numerica", valor } : null;
      case "texto":
        return valor.trim() ? { tipo: "texto", valor } : null;
      case "ordenar":
        return { tipo: "ordenar", orden };
      case "completar-codigo":
        return huecos.every((h) => h.trim()) ? { tipo: "completar-codigo", huecos } : null;
      case "verdadero-falso":
        return vf !== null && justificacion
          ? { tipo: "verdadero-falso", valor: vf, justificacion }
          : null;
    }
  }, [ejercicio.tipo, opcion, valor, orden, huecos, vf, justificacion]);

  const bloqueado = correccion !== null;

  function comprobar() {
    if (!respuesta || bloqueado) return;
    const resultado = corregir(ejercicio, respuesta);
    setCorreccion(resultado);
    onCorregido?.(resultado);
  }

  function mover(indice: number, delta: -1 | 1) {
    const destino = indice + delta;
    if (destino < 0 || destino >= orden.length) return;
    const copia = [...orden];
    [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
    setOrden(copia);
  }

  const campo =
    "min-h-11 w-full rounded-md border border-line-strong bg-canvas px-3 text-base text-ink disabled:opacity-70";

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (correccion) onContinuar(correccion.correcto);
        else comprobar();
      }}
    >
      <p className="text-lg font-semibold text-ink">{ejercicio.enunciado}</p>
      {ejercicio.codigo ? (
        <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-sm text-ink" tabIndex={0}>
          <code>{ejercicio.codigo}</code>
        </pre>
      ) : null}

      {ejercicio.tipo === "opcion-multiple" ? (
        <fieldset className="flex flex-col gap-2" disabled={bloqueado}>
          <legend className="sr-only">Elige una opción</legend>
          {ejercicio.opciones.map((o) => (
            <label
              key={o.id}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-canvas px-3 py-2.5 text-ink has-[:checked]:border-primary"
            >
              <input
                type="radio"
                name={grupo}
                checked={opcion === o.id}
                onChange={() => setOpcion(o.id)}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span>{o.texto}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {ejercicio.tipo === "numerica" || ejercicio.tipo === "texto" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={`${grupo}-v`} className="text-sm font-semibold text-ink">
            Tu respuesta{ejercicio.tipo === "numerica" && ejercicio.unidad ? ` (${ejercicio.unidad})` : ""}
          </label>
          <input
            id={`${grupo}-v`}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={bloqueado}
            inputMode={ejercicio.tipo === "numerica" ? "decimal" : "text"}
            autoComplete="off"
            className={campo}
          />
        </div>
      ) : null}

      {ejercicio.tipo === "ordenar" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-muted">Usa los botones para subir o bajar cada paso hasta ordenarlos.</p>
          <ol className="flex flex-col gap-2">
            {orden.map((id, i) => {
              const paso = ejercicio.pasos.find((p) => p.id === id);
              return (
                <li key={id} className="flex items-center gap-2 rounded-md border border-line-strong bg-canvas p-2">
                  <span className="w-6 text-center font-semibold tabular-nums text-ink-muted">{i + 1}</span>
                  <span className="flex-1 text-ink">{paso?.texto}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={bloqueado || i === 0}
                    onClick={() => mover(i, -1)}
                    aria-label={`Subir: ${paso?.texto}`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={bloqueado || i === orden.length - 1}
                    onClick={() => mover(i, 1)}
                    aria-label={`Bajar: ${paso?.texto}`}
                  >
                    ↓
                  </Button>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {ejercicio.tipo === "completar-codigo" ? (
        <pre className="overflow-x-auto rounded-md bg-surface-2 p-3 text-sm leading-[3.25rem] text-ink">
          <code>
            {ejercicio.plantilla.split("___").map((trozo, i, todos) => (
              <span key={i}>
                {trozo}
                {i < todos.length - 1 ? (
                  <input
                    aria-label={`Hueco ${i + 1} de ${todos.length - 1}`}
                    value={huecos[i] ?? ""}
                    onChange={(e) => setHuecos(huecos.map((h, j) => (j === i ? e.target.value : h)))}
                    disabled={bloqueado}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className={
                      "mx-1 inline-block min-h-11 w-32 rounded border bg-canvas px-2 font-mono text-sm " +
                      (correccion?.huecos
                        ? correccion.huecos[i]
                          ? "border-success"
                          : "border-danger"
                        : "border-line-strong")
                    }
                  />
                ) : null}
              </span>
            ))}
          </code>
        </pre>
      ) : null}

      {ejercicio.tipo === "verdadero-falso" ? (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-wrap gap-2" disabled={bloqueado}>
            <legend className="mb-2 text-sm font-semibold text-ink">¿Es verdadera o falsa?</legend>
            {[true, false].map((v) => (
              <label
                key={String(v)}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-canvas px-3 text-ink has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name={`${grupo}-vf`}
                  checked={vf === v}
                  onChange={() => setVf(v)}
                  className="size-4 accent-primary"
                />
                {v ? "Verdadera" : "Falsa"}
              </label>
            ))}
          </fieldset>
          <fieldset className="flex flex-col gap-2" disabled={bloqueado}>
            <legend className="mb-2 text-sm font-semibold text-ink">¿Por qué?</legend>
            {ejercicio.justificaciones.map((j) => (
              <label
                key={j.id}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-line-strong bg-canvas px-3 py-2.5 text-ink has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name={`${grupo}-j`}
                  checked={justificacion === j.id}
                  onChange={() => setJustificacion(j.id)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                />
                <span>{j.texto}</span>
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}

      {correccion ? (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          className={
            "flex flex-col gap-1 rounded-lg border-l-4 bg-canvas px-4 py-3 text-ink " +
            (correccion.correcto ? "border-success" : "border-danger")
          }
        >
          <p className="font-semibold">{correccion.correcto ? "Correcto." : "No es correcto."}</p>
          {!correccion.correcto && correccion.retro ? <p>{correccion.retro}</p> : null}
          <p className="text-ink-muted">{correccion.explicacion}</p>
        </div>
      ) : null}

      <div>
        {correccion ? (
          <Button type="submit">{textoContinuar}</Button>
        ) : (
          <Button type="submit" disabled={respuesta === null}>
            Comprobar
          </Button>
        )}
      </div>
    </form>
  );
}
