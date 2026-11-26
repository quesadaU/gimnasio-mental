/**
 * Primitivas accesibles compartidas. API estable: los módulos programan contra ella.
 * Los cambios deben ser aditivos (nuevas props opcionales, nuevos componentes).
 */
export { Button, ButtonLink, buttonClasses } from "./button";
export type { ButtonProps, ButtonLinkProps, ButtonSize, ButtonVariant } from "./button";
export { Card, CardHeader, CardTitle, CardBody } from "./card";
export { Container, PageHeader } from "./layout";
export {
  ProgressBar,
  Badge,
  Stat,
  Spinner,
  LoadingState,
  EmptyState,
  ErrorState,
} from "./feedback";
export type { BadgeTone } from "./feedback";
export { SessionEndScreen } from "./session-end-screen";
export type { SessionSummaryItem } from "./session-end-screen";
export { ConfirmDialog } from "./confirm-dialog";
export { cx } from "./cx";
