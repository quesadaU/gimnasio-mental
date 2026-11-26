/** Une clases condicionales sin dependencias (alternativa mínima a clsx). */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
