import type { ReactNode } from "react";
import { Badge, ButtonLink, Card, CardBody, CardHeader, CardTitle, Container, PageHeader } from "@/components/ui";

interface ComingSoonProps {
  title: string;
  description: string;
  willDo: readonly string[];
  willTitle?: string;
  wontDo: readonly string[];
  footnote?: ReactNode;
}

/** Placeholder honesto para módulos en estado "proximamente". */
export function ComingSoon({ title, description, willDo, willTitle = "Lo que premiará", wontDo, footnote }: ComingSoonProps) {
  return (
    <Container size="md">
      <PageHeader eyebrow="Próximamente" title={title} description={description}>
        <Badge tone="info">Todavía no disponible</Badge>
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle as="h2">{willTitle}</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {willDo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h2">Lo que nunca hará</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {wontDo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
      {footnote ? <div className="mt-6 text-ink-muted">{footnote}</div> : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/progreso" variant="secondary">
          Ver mi progreso
        </ButtonLink>
        <ButtonLink href="/" variant="ghost">
          Volver al inicio
        </ButtonLink>
      </div>
    </Container>
  );
}
