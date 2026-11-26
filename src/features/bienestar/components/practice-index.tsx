import { Badge, ButtonLink, Card, CardBody, CardHeader, CardTitle } from "@/components/ui";
import { PRACTICE_CATEGORIES } from "../domain/types";
import { practicesByCategory } from "../registry";

/** Índice de prácticas por categoría. Server Component: solo lee metadatos del registro. */
export function PracticeIndex() {
  return (
    <div className="space-y-12">
      {PRACTICE_CATEGORIES.map((category) => {
        const practices = practicesByCategory(category.id);
        if (practices.length === 0) return null;
        const headingId = `categoria-${category.id}`;
        return (
          <section key={category.id} aria-labelledby={headingId} className="space-y-4">
            <div>
              <h2 id={headingId} className="text-2xl font-semibold">
                {category.title}
              </h2>
              <p className="mt-1 text-ink-muted">{category.description}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {practices.map((practice) => (
                <li key={practice.slug} className="flex">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>{practice.definition.title}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="mb-3">
                        <Badge>
                          <span className="sr-only">Duración: </span>
                          {practice.durationLabel}
                        </Badge>
                      </p>
                      <p className="leading-relaxed">{practice.purpose}</p>
                      <div className="mt-4">
                        <ButtonLink href={`/bienestar/${practice.slug}`}>
                          Empezar<span className="sr-only">: {practice.definition.title}</span>
                        </ButtonLink>
                      </div>
                    </CardBody>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
