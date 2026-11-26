import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold leading-none " +
  "transition-colors duration-150 select-none " +
  "disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-ink hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2 underline-offset-4 hover:underline",
};

/* Tamaños con objetivo táctil mínimo de 44 px en md/lg y 36 px en sm (WCAG 2.5.8 exige 24 px). */
const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

export function buttonClasses({ variant = "primary", size = "md" }: ButtonStyleProps = {}): string {
  return cx(BASE, VARIANTS[variant], SIZES[size]);
}

export type ButtonProps = ButtonStyleProps & ComponentPropsWithRef<"button">;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cx(buttonClasses({ variant, size }), className)} {...props} />;
}

export type ButtonLinkProps = ButtonStyleProps & ComponentPropsWithRef<typeof Link>;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cx(buttonClasses({ variant, size }), className)} {...props} />;
}
