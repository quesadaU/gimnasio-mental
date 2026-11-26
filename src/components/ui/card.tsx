import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

export function Card({ as: Component = "div", className, children, ...rest }: CardProps) {
  return (
    <Component
      {...rest}
      className={cx(
        "relative flex flex-col rounded-lg border border-line bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </Component>
  );
}

interface CardPartProps {
  className?: string;
  children: ReactNode;
}

export function CardHeader({ className, children }: CardPartProps) {
  return <div className={cx("flex flex-col gap-1.5 px-5 pt-5 sm:px-6 sm:pt-6", className)}>{children}</div>;
}

interface CardTitleProps extends CardPartProps {
  id?: string;
  /** Nivel de encabezado; por defecto h3 (las páginas ya tienen h1 y secciones h2). */
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ as: Heading = "h3", id, className, children }: CardTitleProps) {
  return <Heading id={id} className={cx("text-xl font-semibold text-ink", className)}>{children}</Heading>;
}

export function CardBody({ className, children }: CardPartProps) {
  return (
    <div className={cx("flex flex-1 flex-col gap-3 px-5 py-5 text-ink-muted sm:px-6", className)}>
      {children}
    </div>
  );
}
