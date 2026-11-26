"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Card, CardBody, CardHeader } from "@/components/ui";

const MAX_LENGTH = 400;

interface SelfExplanationProps {
  onDone: (sentence: string) => void;
}

/**
 * Autoexplicación en una frase. Explicar con palabras propias obliga a reconstruir el sentido global
 * del texto, no solo a reconocer frases. Lo escrito vive solo en la memoria de esta pantalla:
 * no se guarda en el navegador ni se envía a ningún sitio.
 */
export function SelfExplanation({ onDone }: SelfExplanationProps) {
  const [sentence, setSentence] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldId = useId();
  const hintId = useId();
  const titleId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const trimmed = sentence.trim();

  return (
    <Card as="section" aria-labelledby={titleId}>
      <CardHeader>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Paso 1 de 3</p>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-2xl font-semibold text-ink">
          Explícalo en una frase
        </h2>
      </CardHeader>
      <CardBody>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onDone(trimmed);
          }}
        >
          <label htmlFor={fieldId} className="font-semibold text-ink">
            Sin volver al texto, ¿de qué trata y cuál es su idea principal?
          </label>
          <textarea
            id={fieldId}
            value={sentence}
            onChange={(event) => setSentence(event.target.value)}
            maxLength={MAX_LENGTH}
            rows={3}
            aria-describedby={hintId}
            className="w-full rounded-md border border-line-strong bg-canvas p-3 text-base text-ink"
          />
          <p id={hintId} className="text-sm text-ink-muted">
            Lo que escribas no se guarda ni sale de este dispositivo: solo lo verás tú al final, para
            compararlo con las ideas clave. Una frase imperfecta sirve; lo que cuenta es el intento.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={trimmed.length === 0}>
              Continuar
            </Button>
            <Button type="button" variant="ghost" onClick={() => onDone("")}>
              Saltar este paso
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

