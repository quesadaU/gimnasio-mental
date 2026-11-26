import type { ReadingText } from "../domain/types";

/** Autoría, licencia y referencias del texto: visibles, sin enlaces que saquen del lector. */
export function SourceNote({ text }: { text: ReadingText }) {
  const { source, references } = text;
  return (
    <footer className="mt-8 flex flex-col gap-2 font-sans text-sm text-[var(--r-muted)]">
      <p>
        <span className="font-semibold">{source.kind === "dominio-publico" ? "Fuente" : "Autoría"}:</span>{" "}
        {source.author}
        {source.work ? <>, <cite>{source.work}</cite></> : null}
        {source.year ? ` (${source.year})` : null}. {source.license}.
      </p>
      {source.note ? <p>{source.note}</p> : null}
      {source.reference ? <p>{source.reference}</p> : null}
      {references && references.length > 0 ? (
        <details className="rounded-md">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold">
            Referencias para ampliar
          </summary>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {references.map((reference) => (
              <li key={reference}>{reference}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </footer>
  );
}
