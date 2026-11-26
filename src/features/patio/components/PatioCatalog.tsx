import { Badge, ButtonLink, Card, CardBody, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { PATIO_ENTRIES } from "../registry";
import { SKILL_LABEL, entriesByGroup } from "./catalog";
import { RememberedLevel } from "./RememberedLevel";

/** Catálogo del Patio agrupado por habilidad. Server Component: el nivel recordado es una hoja cliente. */
export function PatioCatalog() {
  const groups = entriesByGroup(PATIO_ENTRIES);
  return (
    <div className="flex flex-col gap-14">
      {groups.map(({ group, entries }) => {
        const headingId = `grupo-${group.id}`;
        return (
          <section key={group.id} aria-labelledby={headingId} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 id={headingId} className="text-3xl font-semibold text-ink">
                {group.title}
              </h2>
              <p className="text-ink-muted">{group.description}</p>
            </div>
            {entries.length === 0 ? (
              <EmptyState
                title={`Todavía no hay juegos de ${group.title.toLowerCase()}`}
                description="Están en preparación. Mientras tanto, prueba un juego de otro grupo: alternar habilidades es buena idea."
              />
            ) : (
              <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map(({ definition }) => {
                  const titleId = `juego-${definition.id}`;
                  return (
                    <li key={definition.id} className="flex">
                      <Card as="article" aria-labelledby={titleId} className="w-full">
                        <CardHeader>
                          <CardTitle id={titleId}>{definition.title}</CardTitle>
                          <p className="text-sm text-ink-muted">
                            ≈ {definition.estimatedMinutes} min
                            {definition.adaptive ? " · dificultad adaptativa" : ""}
                          </p>
                        </CardHeader>
                        <CardBody>
                          <p>{definition.description}</p>
                          <ul role="list" aria-label="Habilidades que practica" className="flex flex-wrap gap-2">
                            {definition.skills.map((skill) => (
                              <li key={skill}>
                                <Badge>{SKILL_LABEL[skill]}</Badge>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                            <RememberedLevel exerciseId={definition.id} max={definition.difficulty.max} />
                            <ButtonLink href={`/patio/${definition.id}`} size="sm">
                              Empezar<span className="sr-only"> {definition.title}</span>
                            </ButtonLink>
                          </div>
                        </CardBody>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
