import { useId } from "react";
import { buttonClasses } from "@/components/ui";

type Variant = "full" | "compact" | "warm";

interface CrisisResourcesProps {
  /** full: índice; compact: pie de cada práctica; warm: cuando el texto del diario sugiere malestar intenso. */
  variant?: Variant;
  headingLevel?: "h2" | "h3";
}

const linkClass = `${buttonClasses({ variant: "primary" })} shrink-0`;

/**
 * Recursos de ayuda. Es contenido estático: se puede renderizar en servidor y en cliente.
 * Los teléfonos son de España; se indica qué hacer fuera de España.
 */
export function CrisisResources({ variant = "full", headingLevel = "h2" }: CrisisResourcesProps) {
  const headingId = useId();
  const Heading = headingLevel;
  const title = variant === "warm" ? "No tienes que pasar por esto a solas" : "Si lo estás pasando mal";

  return (
    <aside
      aria-labelledby={headingId}
      className="rounded-xl border-2 border-warning/60 bg-warning-soft p-5 text-ink sm:p-6"
    >
      <Heading id={headingId} className="text-lg font-semibold sm:text-xl">
        {title}
      </Heading>

      {variant === "warm" ? (
        <p className="mt-2 leading-relaxed">
          Por lo que has escrito, parece que estás atravesando algo muy duro. Gracias por ponerle palabras. Hablar con
          alguien ahora puede ayudar, y hay personas preparadas para escucharte en cualquier momento.
        </p>
      ) : (
        <p className="mt-2 leading-relaxed">
          Estas prácticas pueden acompañarte en el día a día, pero no son terapia ni sustituyen a un profesional de la
          salud mental. Si sientes que no puedes más o piensas en hacerte daño, pide ayuda: no estás solo ni sola.
        </p>
      )}

      <ul className={variant === "compact" ? "mt-3 space-y-3" : "mt-4 space-y-4"}>
        <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Línea 024</strong>, atención a la conducta suicida (España). Gratuita, confidencial, las 24 horas.
          </p>
          <a href="tel:024" className={linkClass}>
            Llamar al 024
          </a>
        </li>
        <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>112</strong>, emergencias, si tu vida o la de otra persona corre peligro ahora.
          </p>
          <a href="tel:112" className={linkClass}>
            Llamar al 112
          </a>
        </li>
        <li>
          <p>
            <strong>Fuera de España</strong>, llama al número de emergencias de tu país o busca su línea de prevención
            del suicidio.
          </p>
        </li>
      </ul>

      {variant !== "compact" && (
        <p className="mt-4 leading-relaxed">
          También puedes hablar con tu médico de cabecera, con un profesional de la psicología o con una persona de
          confianza.
        </p>
      )}
    </aside>
  );
}
